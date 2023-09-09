const { Buffer } = require('node:buffer');
const express = require('express');
const router = express.Router();
const { SerialPort, SerialPortMock } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { wait } = require('../helpers/utils');
const { numToHex } = require('../helpers/converters');

class SerialComms {
  constructor() {
    this.port = new SerialPort({
      path: '/dev/tty.usbserial-FTALFJHL',
      baudRate: 9600,
      autoOpen: false
    });
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
      const frequency = parseInt(req.fields.frequency);
      const id = parseInt(req.fields.id);
      console.log(`Should set ID: ${id} to Frequency: ${frequency}`);
      this.sendFrequencyToVoice(id, frequency);
      res.status(200).send({
        message: 'OK, hit frequency, not doing anything right now though'
      });
    });
    router.post('/volume', (req, res) => {
      console.log(req.fields);
      const volume = req.fields.volume;
      const id = req.fields.id;
      console.log(`Should set ID: ${id} to Volume: ${volume}`);
      this.sendVolumeToVoice(id, volume);
      // Send the volume to voice ID = id
      res.status(200).send({
        message: 'OK, hit volume, not doing anything right now though'
      });
    });
    router.all('/noise/:toggle', (req, res) => {
      console.log(req.params.toggle);
      console.log(`Should set Noise Toggle to: ${req.params.toggle}`);
      // Send the volume to voice ID = id
      res.status(200).send({
        message: 'OK, hit noise toggle, not doing anything right now though'
      });
    });
  }
  async start() {
    console.log('waiting five seconds...');
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
      bufferMessage = Buffer.from(['0x9' + hexVol], 'hex');
    } else if (voiceNum === 1) {
      bufferMessage = Buffer.from(['0xb' + hexVol], 'hex');
    } else {
      bufferMessage = Buffer.from(['0xd' + hexVol], 'hex');
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
