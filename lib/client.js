'use strict';

const mqtt = require('mqtt');
const promisify = require('pify');
const MqttChannel = require('./channel');

class MqttClient {

  // static instance = null;
  constructor (config, ctx) {

    // if(MqttClient.instance) {
    //   delete MqttClient.instance.createInstance;
    //   return MqttClient.instance;
    // }

    this.inHandlers = [];
    this.outHandlers = [];

    this.config = config;
    this.ctx = ctx;
    this.channel = null;

    this.parser = {};
    this.chain = {};
    // return MqttClient.instance = this;
  }

  useInHandler(fn) {
    this.inHandlers.push(fn);
  }

  useOutHandler(fn) {
    this.outHandlers.push(fn);
  }

  init() {
    if (this.client) return;

    this.client = mqtt.connect(this.config.host, {
      port: this.config.port,
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

    this.channel = new MqttChannel(this.client, this.ctx);

    this.inHandlers.forEach((inHandler) => {
      this.channel.addInHandler(inHandler);
    });

    this.outHandlers.forEach((outHandler) => {
      this.channel.addOutHandler(outHandler);
    });
  }
}

module.exports = MqttChannel;
