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
    // message middleware
    inMiddleware: ['dispatcher'],
    // publish middleware
    outMiddleware: ['encoder'],
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

```js create class file on /app/mqtt/middleware to base chain

export class BaseChain {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async next(...arg) {
    if (this.chain != null) {
      return await this.chain.handle(...arg);
    }

    return [...arg];
  }
}

```

```js create class file on /app/mqtt/middleware to handle message

const BaseChain = require('./base_chain');

class Dispatcher extends BaseChain {
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

```js create class file on /app/mqtt/middleware to handle publish


const BaseChain = require('./base_chain');

class Encoder extends BaseChain {
  constructor(ctx) {
    super(ctx);
  }

  async handle(topic, message, options) {
    try {
      this.ctx.logger.info('Encoder, topic: %s, message: %s, options: %s', topic, message, options);

      return await this.next(topic, message, options);
    } catch(ex) {
      this.ctx.logger.error(ex.message);
      return [topic, message, options];
    }
  }
}

module.exports = Encoder;

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
      // message middleware
      inMiddleware: ['dispatcher'],
      // publish middleware
      outMiddleware: ['encoder'],
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

const client2 = app.mqtt.get('mqtt2');
client2.channel.publish(topic, message, options);
client2.channel.subscribe(topic, options);

```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
