'use strict';

const path = require('path');

module.exports = app => {

  let dirs = app.loader.getLoadUnits().map(unit => path.join(unit.path, 'app', 'mqtt', 'middleware'));

  app.cuteMQTT = {};
  app.cuteMQTT.middleware = {};
  new app.loader.FileLoader({
    directory: dirs,
    target: app.cuteMQTT.middleware,
    inject: app,
  }).load();

  /* istanbul ignore next */
  app.cuteMQTT.__defineGetter__('middlewares', () => {
    app.deprecate('app.cuteMQTT.middlewares has been deprecated, please use app.cuteMQTT.middleware instead!');
    return app.cuteMQTT.middleware;
  });

};
