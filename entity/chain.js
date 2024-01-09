"use strict";

class Chain {
  constructor(ctx) {
    this.ctx = ctx;
    this.chain = null;
    this.channel = null;
  }

  async next(...arg) {
    if (this.chain != null) {
      return await this.chain.handle(...arg);
    }
    return [...arg];
  }

  async handle() {
    throw new Error('SubClass must impl this');
  }
}

module.exports = Chain;
