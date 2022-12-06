'use strict';

const mqtt = require('./lib/mqtt');

module.exports = app => {
  if (app.config.mqtt.app) mqtt(app);

  app.ready(() => {
    app.mqtt.init();
    app.mqtt.config.topics.forEach(async (t) =>  {
      await app.mqtt.channel.subscribe(t.topic, t.options);
    });  
  });
};
