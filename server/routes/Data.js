const { Buffer } = require('node:buffer');
const express = require('express');
const router = express.Router();
const { wait } = require('../helpers/utils');

class Data {
  constructor() {
    this.sequences = [null, null, null];
    this.addMiddleWare();
    this.addRouteListeners();
    return router;
  }
  addMiddleWare() {
    router.use((req, res, next) => {
      console.log('Data endpoint hit');
      next();
    });
  }
  addRouteListeners() {
    router.all('/', (req, res) => {
      res.status(200).send({ message: 'OK!', data: this.sequences });
    });
    router.post('/store', (req, res) => {
      const sequence = req.fields.sequence;
      const id = parseInt(req.fields.id);
      this.sequences[id] = req.fields.sequence;
      res.status(200).send({
        message: 'OK, stored some data'
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

module.exports = { Data };
