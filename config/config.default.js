'use strict';

exports.mqtt = {
  app: true,
  agent: false,
  client: {
    host: 'mqtt://127.0.0.1',
    port: 1883,
    username: 'username',
    password: 'password',
    clientId: 'client_id',
    options: {
      keeplive: 60,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      rejectUnauthorized: false,
      will: {
        topic: 'client_id',
        payload: 'offline',
        qos: 2,
        retain: true
      },
    },
    onlinePayload: '',
    topics: [],
    inMiddleware: [],
    outMiddleware: [],
  }
};
