const { Buffer } = require('node:buffer');
const express = require('express');
const router = express.Router();
const { SerialPort, SerialPortMock } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { wait } = require('../helpers/utils');
const {
  numToHex,
  midiToFrequency,
  frequencyToMidi
} = require('../helpers/converters');

class SerialComms {
  constructor() {
    this.port = new SerialPort({
      path: '/dev/tty.usbserial-FTALFJHL',
      baudRate: 9600,
      autoOpen: false
    });
    this.voiceInfo = [
      { id: 0, frequency: 510 },
      { id: 1, offset: 2 },
      { id: 2, offset: 3 }
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
      console.log('Serial Comms endpoint hit');
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
      console.log('Parser Data:', data);
    });
  }
  addRouteListeners() {
    router.all('/', (req, res) => {
      res.status(200).send({ message: 'OK, but nothing to see here' });
    });
    router.post('/frequency', (req, res) => {
      const id = parseInt(req.fields.id);
      let frequency;
      if (id === 0) {
        frequency = parseInt(req.fields.frequency);
        this.voiceInfo[0].frequency = frequency;
      } else {
        const offset = parseInt(req.fields.offset);
        frequency = midiToFrequency(
          frequencyToMidi(this.voiceInfo[0].frequency) + offset
        );
        this.voiceInfo[id].offset = offset;
      }
      console.log(`Should set ID: ${id} to Frequency: ${frequency}`);
      // this.sendFrequencyToVoice(id, frequency);
      res.status(200).send({
        message: 'OK, hit frequency, not doing anything right now though'
      });
    });
    router.post('/volume', (req, res) => {
      console.log(req.fields);
      const volume = req.fields.volume;
      const id = req.fields.id;
      console.log(`Should set ID: ${id} to Volume: ${volume}`);
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
          console.log('message written');
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
      console.log(noiseVol, noiseType, noiseShift);
      hexToSend = 0xff;
      hexToSend = '0x' + (0xf0 + (15 - noiseVol)).toString(16);
      bufferMessage = Buffer.from([hexToSend], 'hex');
      console.log('about to write first part of it!!!', bufferMessage);
      this.port.write(bufferMessage, (err) => {
        if (err) {
          return console.log('Error on write: ', err.message);
        }
        console.log('message written');
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
      console.log('what is hex to send', hexToSend);
      bufferMessage = Buffer.from([hexToSend], 'hex');
      console.log('about to write second part of it!!!', bufferMessage);
      this.port.write(bufferMessage, (err) => {
        if (err) {
          return console.log('Error on write: ', err.message);
        }
        console.log('message written');
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
  sendFrequencyToVoice(voiceNum, frequency) {
    let bufferMessage;
    if (voiceNum === 0) {
      bufferMessage = Buffer.from(
        [0x90].concat(numToHex(voiceNum, frequency)),
        'hex'
      );
    } else if (voiceNum === 1) {
      bufferMessage = Buffer.from(
        [0xb0].concat(numToHex(voiceNum, frequency)),
        'hex'
      );
    } else {
      bufferMessage = Buffer.from(
        [0xd0].concat(numToHex(voiceNum, frequency)),
        'hex'
      );
    }
    console.log('about to write it!!!', bufferMessage);
    this.port.write(bufferMessage, (err) => {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written');
    });
  }
  sendVolumeToVoice(voiceNum, volume) {
    let bufferMessage;
    let hexVol = volume.toString(16);
    if (voiceNum === 0) {
      // bufferMessage = Buffer.from(['0x9' + hexVol], 'hex');
      bufferMessage = Buffer.from(
        ['0x9' + hexVol].concat(numToHex(0, this.voiceInfo[0].frequency)),
        'hex'
      );
    } else if (voiceNum === 1) {
      // bufferMessage = Buffer.from(['0xb' + hexVol], 'hex');
      bufferMessage = Buffer.from(
        ['0xb' + hexVol].concat(
          numToHex(1, this.voiceInfo[0].frequency + this.voiceInfo[1].offset)
        ),
        'hex'
      );
    } else {
      // bufferMessage = Buffer.from(['0xd' + hexVol], 'hex');
      bufferMessage = Buffer.from(
        ['0xd' + hexVol].concat(
          numToHex(2, this.voiceInfo[0].frequency + this.voiceInfo[2].offset)
        ),
        'hex'
      );
    }
    console.log('about to write it!!!', bufferMessage);
    this.port.write(bufferMessage, (err) => {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message written');
    });
  }
}

module.exports = { SerialComms };
