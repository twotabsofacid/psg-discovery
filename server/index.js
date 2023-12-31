require('dotenv').config();
const express = require('express');
const cors = require('cors');
const formidableMiddleware = require('express-formidable');
const http = require('node:http');
const path = require('node:path');
const { SerialComms } = require('./routes/SerialComms');
const { Data } = require('./routes/Data');
const port = process.env.PORT ?? '1337';

class Server {
  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.use(
      formidableMiddleware({
        uploadDir: path.join(__dirname, 'tmp')
      })
    );
    this.server = http.createServer(this.app);
    this.setup();
    this.addRoutes();
    this.start();
  }
  setup() {
    this.app.use((_, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Origin', '*');
      next();
    });
  }
  addRoutes() {
    this.app.use('/serial', new SerialComms());
    this.app.use('/data', new Data());
    this.app.use('*', (req, res) => {
      res.status(200).send({ message: 'Ok, but nothing to see here' });
    });
  }
  start() {
    this.server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  }
}

new Server();
