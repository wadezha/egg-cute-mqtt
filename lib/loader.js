'use strict';

const assert = require('assert');
const path = require('path');

module.exports = (config, app) => {

  assert(config, '[egg-cute-mqtt] config invalid');

  if (config.parserPath) {
    const directory = path.join(app.config.baseDir, config.parserPath);
    app.loader.loadToApp(directory, 'mqttParser');
  }

  if (config.chainPath) {
    const directory = path.join(app.config.baseDir, config.chainPath);
    app.loader.loadToApp(directory, 'mqttChain');
  }

  app.cuteMQTT = {};
  // app.cuteMQTT.middleware = {};
  // const dirs = app.loader.getLoadUnits().map(unit => path.join(unit.path, 'app', 'mqtt', 'middleware'));
  // new app.loader.FileLoader({
  //   directory: dirs,
  //   target: app.cuteMQTT.middleware,
  //   inject: app,
  // }).load();

  app.cuteMQTT.__defineGetter__('middleware', () => {
    app.deprecate('app.cuteMQTT.middleware has been deprecated, please use app.mqttChain instead!');
    return app.mqttChain;
  });

};
