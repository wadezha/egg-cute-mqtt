'use strict';

const mqtt = require('./lib/mqtt');

module.exports = app => {
  if (app.config.mqtt.app) mqtt(app);

  app.ready(() => {
    if (app.config.mqtt.client) {
      const client = app.mqtt;
      client.init();
      subscribeTopics(app, client);
    }
    if (app.config.mqtt.clients) {
      for (const k of Object.keys(app.config.mqtt.clients)) {
        const client = app.mqtt.get(k);
        client.init();
        subscribeTopics(app, client);
      }
    }
  });
};

function subscribeTopics(app, client) {
  const topics = client.config.topics || [];
  Promise.all(topics.map(t => client.channel.subscribe(t.topic, t.options)))
    .catch(err => { app.coreLogger.error('[egg-cute-mqtt] subscribe topics failed: %s', err.message); });
}
