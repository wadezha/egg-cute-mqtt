'use strict';

const mqtt = require('./lib/mqtt');

module.exports = app => {
  if (app.config.mqtt.app) mqtt(app);

  app.ready(() => {
    if (app.config.mqtt.client) {
      app.mqtt.init();
      app.mqtt.config.topics.forEach(async (t) =>  {
        await app.mqtt.channel.subscribe(t.topic, t.options);
      }); 
    }
    if (app.config.mqtt.clients) {
      for (const k of Object.keys(app.config.mqtt.clients)) {
        app.mqtt.get(k).init();
        app.mqtt.get(k).config.topics.forEach(async (t) =>  {
          await app.mqtt.get(k).channel.subscribe(t.topic, t.options);
        }); 
      }
    } 
  });
};
