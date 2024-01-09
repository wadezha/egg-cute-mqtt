# egg-cute-mqtt

Refer to [mqtt]

## Install

```bash
$ npm i egg-cute-mqtt --save
```

mqtt Plugin for egg, support egg application connect to mqtt.

## Configuration

Change `${app_root}/config/plugin.js` to enable mqtt plugin:

```js
exports.mqtt = {
  enable: true,
  package: 'egg-cute-mqtt',
};
```

Configure mqtt information in `${app_root}/config/config.default.js`:

### Simple mqtt instance

```js
exports.mqtt = {
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
    onlinePayload: 'online',
    topics: [],
    parserPath: '',
    chainPath: '',
    // subscribe middleware
    inChain: ['dispatcher'],
    // publish middleware
    outChain: ['encoder'],
  },
  // load into app, default is open
  app: true,
  // load into agent, default is close
  agent: false,
};

Note:
1. If multi-threading is enabled on the server
  - Topics recommends using shared subscription ($share/group_name/topic) 
  - iot-cute-mqtt will automatically add the thread ID after the clientId, for example, clientId: 'client_id_18331'

2. will.topic, will.payload, onlinePayload support ${clientId} replacement, for example onlinePayload: '${clientId}, online' will be replaced by 'client_id, online'

```

Usage:

```js  publish and subscribe

app.mqtt.channel.publish(topic, message, options);
app.mqtt.channel.subscribe(topic, options);


```

```js create class file on /app/mqtt/chain to handle message

import { Chain } from 'egg-cute-mqtt';

class Dispatcher extends Chain {
  constructor(ctx) {
    super(ctx);
  }

  async handle(topic, message) {
    try {
      this.ctx.logger.info('dispatcher, topic: %s, message: %s', topic, message);

      return await this.next(topic, message);
    } catch(ex) {
      this.ctx.logger.error(ex.message);
      return [topic, message];
    }
  }
}

module.exports = Dispatcher;

```

```js create class file on /app/mqtt/chain to handle publish


import { Chain } from 'egg-cute-mqtt';

class OutChain1 extends Chain {
  constructor(ctx) {
    super(ctx);
  }

  async handle(topic, message, options) {
    try {
      this.ctx.logger.info('OutChain1, topic: %s, message: %s, options: %s', topic, message, options);

      return await this.next(topic, message, options);
    } catch(ex) {
      this.ctx.logger.error(ex.message);
      return [topic, message, options];
    }
  }
}

module.exports = OutChain1;

```

```js create class file on /app/mqtt/parser to handle protocol


import { Parser } from 'egg-cute-mqtt';

class Cute extends Parser {
  constructor(ctx) {
    super(ctx);
  }

  async decode(hex) {
    return '';
  }
}

module.exports = Cute;

```
### Multiple mqtt instance

```js
exports.mqtt = {
  clients: {
    mqtt1: {
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
      onlinePayload: 'online',
      topics: [],
      parserPath: 'mqtt/parser',
      chainPath: 'mqtt/chain',
      // subscribe middleware
      inChain: ['dispatcher'],
      // publish middleware
      outChain: ['outChain1'],
    },
    // ...
  },
  // load into app, default is open
  app: true,
  // load into agent, default is close
  agent: false,
};
```

Usage:

```js
const client1 = app.mqtt.get('mqtt1');
client1.channel.publish(topic, message, options);
client1.channel.subscribe(topic, options);
client1.parser.cute.decode(hex);

const client2 = app.mqtt.get('mqtt2');
client2.channel.publish(topic, message, options);
client2.channel.subscribe(topic, options);

```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
