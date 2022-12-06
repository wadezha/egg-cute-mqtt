'use strict';

const assert = require('assert');

const MQTTClient = require('./client');
const loader = require('./loader');

module.exports = app => {
  loader(app);
  app.addSingleton('mqtt', createClient);
};

function createClient(config, app) {

  assert(config.host && config.port && config.clientId && config.username && config.password,
    `[egg-cute-mqtt] 'host: ${config.host}', 'port: ${config.port}', 'clientId: ${config.clientId}', 'username: ${config.username}', 'password: ${config.password}' are required on config`);

  const ctx = app.createAnonymousContext({ method: 'MQTT', url: `/mqtt`, });
  const client = new MQTTClient(config, ctx);

  config.inMiddleware.filter(f => Object.keys(app.cuteMQTT.middleware).includes(f)).forEach(k => {
    client.useInHandler(new app.cuteMQTT.middleware[k](ctx, app));
  });

  config.outMiddleware.filter(f => Object.keys(app.cuteMQTT.middleware).includes(f)).forEach(k => {
    client.useOutHandler(new app.cuteMQTT.middleware[k](ctx, app));
  });

  app.beforeStart(async () => {
    app.coreLogger.info('[egg-cute-mqtt] start successfully and server status is ok');
  });

  return client;
}