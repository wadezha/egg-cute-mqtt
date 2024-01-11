
const logger = Symbol('cuteMQTT#logger');
const connect = Symbol('cuteMQTT#connect');

class MQTTChannel {
  constructor(mqtt, ctx) {
    this.lastInChainHandler = null;
    this.inChainHandler = null;
    this.outChainHandler = null;

    this.mqtt = mqtt;
    this.ctx = ctx;
    this.clientId = this.mqtt.options.clientId || 'client_unknow_id';

    this.mqtt.on('connect', this[connect].bind(this));

    this.mqtt.on('reconnect', this[logger].bind(this, 'error', 'reconnect'));
    this.mqtt.on('close', this[logger].bind(this, 'error', 'close'));
    this.mqtt.on('disconnect', this[logger].bind(this, 'error', 'disconnect'));
    this.mqtt.on('offline', this[logger].bind(this, 'error', 'offline'));
    this.mqtt.on('error', this[logger].bind(this, 'error', 'error'));
    this.mqtt.on('end', this[logger].bind(this, 'error', 'end'));

    this.mqtt.on('message', this.dispatch.bind(this));
  }

  addInHandler(handler) {
    handler.chain = null;
    handler.channel = this;
    if (!this.inChainHandler) {
      this.inChainHandler = handler;
    }
    else {
      this.lastInChainHandler.chain = handler;
    }
    this.lastInChainHandler = handler;
  }

  addOutHandler(handler) {
    handler.channel = this;
    handler.chain = this.outChainHandler;
    this.outChainHandler = handler;
  }

  [logger](level, event, ...data) {

    this.ctx.url = `/mqtt/${event}`;

    const format = {
      connect: `, connack: %s`,
      error: `, error: %s`,
      message: `, topic: %s, message: %s`,
      publish: `, topic: %s, message: %s, options: %s`,
      subscribe: `, topic: %s, options: %s`,
      unsubscribe: `, topic: %s, options: %s`,
      end: `, force: %s, options: %s`,
      handleMessage: `, packet: %s`,
    };

    this.ctx.logger[level](`[egg-cute-mqtt] ${event} clientId: %s ${format[event] || ''}`, this.clientId, ...data);
  }

  async [connect](connack) {
    this[logger]('info', 'connect', connack);
    if (this.mqtt.options && this.mqtt.options.will && this.mqtt.options.onlinePayload) {
      const { topic, qos, retain } = this.mqtt.options.will;
      await this.publish(topic, this.mqtt.options.onlinePayload, { qos, retain });
    }
  }

  async dispatch(topic, message) {
    this[logger]('info', 'message', topic, message instanceof Buffer? message.toString('hex').toUpperCase() : message);
    if (this.inChainHandler) {
      await this.inChainHandler.handle.call(this.inChainHandler, topic, message);
    }
  }

  async publish(topic, message, options) {
    this[logger]('info', 'publish', topic, message instanceof Buffer? message.toString('hex').toUpperCase() : message, options);
    if (this.outChainHandler) {
      [topic, message, options] = await this.outChainHandler.handle.call(this.outChainHandler, topic, message, options);
    }
    return this.mqtt.publish(topic, message, options);
  }

  async subscribe(topic, options) {
    const result = await this.mqtt.subscribe(topic, options);
    this[logger]('info', 'subscribe', topic, options);
    return result;
  }

  async unsubscribe(topic, options) {
    const result = await this.mqtt.unsubscribe(topic, options);
    this[logger]('info', 'unsubscribe', topic, options);
    return result;
  }

  async end(force, options) {
    const result = await this.mqtt.end(force, options);
    this[logger]('info', 'end', force, options);
    return result;
  }

  async handleMessage(packet) {
    const result = await this.mqtt.handleMessage(packet);
    this[logger]('info', 'handleMessage', packet);
    return result;
  }

  clear() {
    this.inChainHandler = null;
    this.lastInChainHandler = null;
    this.outChainHandler = null;
  }
}

module.exports = MQTTChannel;
