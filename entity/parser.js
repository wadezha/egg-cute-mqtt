"use strict";

class Parser {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async encode() {
    throw new Error('SubClass must impl this');
  }

  async decode() {
    throw new Error('SubClass must impl this');
  }
}

module.exports = Parser;
