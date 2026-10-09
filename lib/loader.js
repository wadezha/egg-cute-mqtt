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

  app.cuteMqtt = {};
  // app.cuteMqtt.middleware = {};
  // const dirs = app.loader.getLoadUnits().map(unit => path.join(unit.path, 'app', 'mqtt', 'middleware'));
  // new app.loader.FileLoader({
  //   directory: dirs,
  //   target: app.cuteMqtt.middleware,
  //   inject: app,
  // }).load();

  app.cuteMqtt.__defineGetter__('middleware', () => {
    app.deprecate('app.cuteMqtt.middleware has been deprecated, please use app.mqttChain instead!');
    return app.mqttChain;
  });

};
