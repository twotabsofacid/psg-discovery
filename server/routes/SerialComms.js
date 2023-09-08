const express = require('express');
const router = express.Router();
const { SerialPort, SerialPortMock } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { wait } = require('../helpers/utils');

class SerialComms {
  constructor() {
    this.port = new SerialPort({
      path: '/dev/ttyACM0',
      baudRate: 11520,
      autoOpen: false
    });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
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
    this.port.on('error', (err) => {
      console.log('Unable to connect to serial port', err);
      const path = '/dev/null';
      SerialPortMock.binding.createPort(path);
      this.port = new SerialPortMock({ path, baudRate: 11520 });
      console.log('Established Mock Serialport connection');
    });
  }
  addRouteListeners() {
    router.all('/', (req, res) => {
      res.status(200).send({ message: 'OK, but nothing to see here' });
    });
    router.post('/frequency', (req, res) => {
      const frequency = req.fields.frequency;
      const id = req.fields.id;
      console.log(`Should set ID: ${id} to Frequency: ${frequency}`);
      // Send the frequency to voice ID = id
      res.status(200).send({
        message: 'OK, hit frequency, not doing anything right now though'
      });
    });
    router.post('/volume', (req, res) => {
      console.log(req.fields);
      const vol = req.fields.volume;
      const id = req.fields.id;
      const frequency = req.fields.frequency;
      console.log(`Should set ID: ${id} to Volume: ${vol}`);
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
    await wait(5000);
    console.log('opening port');
    this.port.open();
  }
}

module.exports = { SerialComms };
