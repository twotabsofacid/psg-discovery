const express = require('express');
const router = express.Router();
const { SerialPort, SerialPortMock } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { wait } = require('../helpers/utils');

class SerialComms {
  constructor() {
    this.port = new SerialPort({
      path: '/dev/ttyACM0',
      badRate: 11520,
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
    });
  }
  addRouteListeners() {
    router.all('/', (req, res) => {
      res.status(200).send({ message: 'OK' });
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
