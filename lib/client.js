'use strict';

const mqtt = require('mqtt');
const promisify = require('pify');
const MQTTChannel = require('./channel');

class MQTTClient {
  constructor (config, ctx) {

    this.inHandlers = [];
    this.outHandlers = [];

    this.config = config;
    this.ctx = ctx;
    this.channel = null;
  }

  useInHandler(fn) {
    this.inHandlers.push(fn);
  }

  useOutHandler(fn) {
    this.outHandlers.push(fn);
  }

  init() {
    this.client = mqtt.connect(this.config.host, {
      clientId: this.config.clientId,
      username: this.config.username,
      password: this.config.password,
      ...this.config.options,
    });

    this.ctx.logger.info('[egg-cute-mqtt] connecting %s@%s:%s', this.config.clientId, this.config.host, this.config.port);

    [
      'publish',
      'subscribe',
      'unsubscribe',
      'end',
      'handleMessage',
    ].forEach(method => {
      this.client[method] = promisify(this.client[method]);
    });

    this.channel = new MQTTChannel(this.client, this.ctx);

    this.inHandlers.forEach((inHandler) => {
      this.channel.addInHandler(inHandler);
    });

    this.outHandlers.forEach((outHandler) => {
      this.channel.addOutHandler(outHandler);
    });
  }
}

module.exports = MQTTClient;
