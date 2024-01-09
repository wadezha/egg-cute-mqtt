'use strict';

const assert = require('assert');

const MQTTClient = require('./client');
const loader = require('./loader');

module.exports = app => {
  app.addSingleton('mqtt', createClient);
};

function createClient(config, app) {

  assert(config.host && config.port && config.clientId && config.username && config.password,
    `[egg-cute-mqtt] 'host: ${config.host}', 'port: ${config.port}', 'clientId: ${config.clientId}', 'username: ${config.username}', 'password: ${config.password}' are required on config`);

  const options = JSON.parse(process.argv[2]);
  config.clientId = options.workers && options.workers > 1 ? `${config.clientId || 'client_unknow_id'}_${process.pid}` : `${config.clientId || 'client_unknow_id'}`;
  if (config.options && config.options.will && config.options.will.topic) {
    config.options.will.topic = config.options.will.topic.replace('${clientId}', config.clientId);
  }
  if (config.options && config.options.will && config.options.will.payload) {
    config.options.will.payload = config.options.will.payload.replace('${clientId}', config.clientId);
  }
  if (config.options && config.options.onlinePayload) {
    config.options.onlinePayload = config.options.onlinePayload.replace('${clientId}', config.clientId);
  }

  const ctx = app.createAnonymousContext({ method: 'MQTT', url: `/mqtt`, });
  const client = new MQTTClient(config, ctx);

  loader(config, app);

  Object.keys(app.mqttParser || {}).forEach(k => {
    client.parser[k] = new app.mqttParser[k](ctx, app);
  });

  Object.keys(app.mqttChain || {}).forEach(k => {
    client.chain[k] = new app.mqttChain[k](ctx, app);
  });

  config.inChain.filter(f => Object.keys(client.chain).includes(f)).forEach(k => {
    client.useInHandler(client.chain[k]);
  });

  config.outChain.filter(f => Object.keys(client.chain).includes(f)).forEach(k => {
    client.useOutHandler(client.chain[k]);
  });

  app.beforeStart(async () => {
    app.coreLogger.info('[egg-cute-mqtt] start successfully and server status is ok');
  });

  return client;
}