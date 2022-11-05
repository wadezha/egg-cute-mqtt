'use strict';

const mqtt = require('./lib/mqtt');

module.exports = agent => {
  if (agent.config.mqtt.agent) mqtt(agent);
};
