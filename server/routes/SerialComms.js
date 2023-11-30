const { Buffer } = require('node:buffer');
const express = require('express');
const router = express.Router();
const { SerialPort, SerialPortMock } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { wait } = require('../helpers/utils');
const { numToHex, midiToNum, numToMidi } = require('../helpers/converters');

class SerialComms {
  constructor() {
    this.port = new SerialPort({
      path: '/dev/tty.usbserial-FTALFJ6I',
      baudRate: 9600,
      autoOpen: false
    });
    this.voiceInfo = [
      { id: 0, numToSend: 510 },
      {
        id: 0,
        numToSend: 510,
        midiNumOffset: 0,
        finegrainNumOffset: 0,
        lfo: false,
        noiseyLfo: false,
        currentLfoOffset: 0
      },
      {
        id: 0,
        numToSend: 510,
        midiNumOffset: 0,
        finegrainNumOffset: 0,
        lfo: false,
        noiseyLfo: false,
        currentLfoOffset: 0
      }
    ];
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
    this.addMiddleWare();
    this.addSerialPortListeners();
    this.addRouteListeners();
    this.start();
    return router;
  }
  addMiddleWare() {
    router.use((req, res, next) => {
      // console.log('Serial Comms endpoint hit');
      next();
    });
  }
  addSerialPortListeners() {
    this.port.on('open', (err) => {
      console.log('PORT OPENED!!!!', err);
    });
    this.port.on('error', (err) => {
      console.log('Unable to connect to serial port', err);
      const path = '/dev/null';
      SerialPortMock.binding.createPort(path);
      this.port = new SerialPortMock({ path, baudRate: 11520 });
      console.log('Established Mock Serialport connection');
    });
    this.parser.on('data', (data) => {
      // console.log('Parser Data:', data);
    });
  }
  addRouteListeners() {
    router.all('/', (req, res) => {
      res.status(200).send({ message: 'OK, but nothing to see here' });
    });
    router.post('/frequency', (req, res) => {
      const id = parseInt(req.fields.id);
      let numToSend;
      if (id === 0) {
        numToSend = parseInt(req.fields.numToSend);
        this.voiceInfo[0].numToSend = numToSend;
        // Update the nums to send for voices 1 and 2...
        const midiNumOffsetToSend1 = Math.round(
          midiToNum(
            numToMidi(this.voiceInfo[0].numToSend) +
              this.voiceInfo[1].midiNumOffset
          )
        );
        this.voiceInfo[1].numToSend =
          midiNumOffsetToSend1 + this.voiceInfo[1].finegrainNumOffset;
        const midiNumOffsetToSend2 = Math.round(
          midiToNum(
            numToMidi(this.voiceInfo[0].numToSend) +
              this.voiceInfo[2].midiNumOffset
          )
        );
        this.voiceInfo[2].numToSend =
          midiNumOffsetToSend2 + this.voiceInfo[2].finegrainNumOffset;
      } else {
        const midiNumOffset = Math.round(req.fields.midiNumOffset);
        const finegrainNumOffset = Math.round(req.fields.finegrainNumOffset);
        const midiNumOffsetToSend = Math.round(
          midiToNum(numToMidi(this.voiceInfo[0].numToSend) + midiNumOffset)
        );
        numToSend = midiNumOffsetToSend + finegrainNumOffset;
        console.log(
          'literally everything...',
          midiNumOffset,
          finegrainNumOffset,
          midiNumOffsetToSend,
          numToSend,
          this.voiceInfo[0].numToSend
        );
        this.voiceInfo[id].midiNumOffset = midiNumOffset;
        this.voiceInfo[id].finegrainNumOffset = finegrainNumOffset;
        this.voiceInfo[id].numToSend = numToSend;
      }
      for (let i = 0; i < 3; i++) {
        console.log(
          `Should set ID: ${i} to Register Value: ${this.voiceInfo[i].numToSend}`
        );
      }
      res.status(200).send({
        message:
          'OK, hit frequency, which should be called something else but here we are'
      });
    });
    router.post('/volume', (req, res) => {
      const volume = req.fields.volume;
      const id = req.fields.id;
      // console.log(`Should set ID: ${id} to Volume: ${volume}`);
      if (id < 3) {
        this.sendVolumeToVoice(id, volume);
      } else {
        let hexToSend = 0xff;
        hexToSend = '0x' + (0xf0 + volume).toString(16);
        let bufferMessage = Buffer.from([hexToSend], 'hex');
        this.port.write(bufferMessage, (err) => {
          if (err) {
            return console.log('Error on write: ', err.message);
          }
        });
      }
      // Send the volume to voice ID = id
      res.status(200).send({
        message: 'OK, hit volume, not doing anything right now though'
      });
    });
    router.post('/noise', async (req, res) => {
      let hexToSend, bufferMessage;
      const noiseVol = req.fields.volume;
      const noiseType = req.fields.noiseType;
      const noiseShift = req.fields.noiseShift;
      hexToSend = 0xff;
      hexToSend = '0x' + (0xf0 + (15 - noiseVol)).toString(16);
      bufferMessage = Buffer.from([hexToSend], 'hex');
      this.port.write(bufferMessage, (err) => {
        if (err) {
          return console.log('Error on write: ', err.message);
        }
      });
      await wait(50);
      hexToSend = noiseType === 'white' ? 0xe4 : 0xe0;
      hexToSend =
        '0x' +
        (
          hexToSend +
          (noiseShift === 'gen3'
            ? 3
            : noiseShift === 'high'
            ? 2
            : noiseShift === 'med'
            ? 1
            : 0)
        ).toString(16);
      bufferMessage = Buffer.from([hexToSend], 'hex');
      this.port.write(bufferMessage, (err) => {
        if (err) {
          return console.log('Error on write: ', err.message);
        }
      });
      // Do a bunch of math here...
      res.status(200).send({
        message: 'OK, change noise'
      });
    });
  }
  async start() {
    console.log('waiting two seconds...');
    await wait(2000);
    console.log('opening port');
    this.port.open();
  }
  sendVolumeToVoice(voiceNum, volume) {
    let bufferMessage;
    let hexVol = volume.toString(16);
    if (voiceNum === 0) {
      // bufferMessage = Buffer.from(['0x9' + hexVol], 'hex');
      bufferMessage = Buffer.from(
        ['0x9' + hexVol].concat(numToHex(0, this.voiceInfo[0].numToSend)),
        'hex'
      );
    } else if (voiceNum === 1) {
      bufferMessage = Buffer.from(
        ['0xb' + hexVol].concat(numToHex(1, this.voiceInfo[1].numToSend)),
        'hex'
      );
    } else {
      bufferMessage = Buffer.from(
        ['0xd' + hexVol].concat(numToHex(2, this.voiceInfo[2].numToSend)),
        'hex'
      );
    }
    this.port.write(bufferMessage, (err) => {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
    });
  }
}

module.exports = { SerialComms };
