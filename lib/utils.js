'use strict';

class Utils {
  constructor(ctx, app) {
    this.ctx = ctx;
    this.app = app;
  }

  recurseInstantiate(val) {
    if (typeof val === 'function') {
      return new val(this.ctx, this.app);
    }
    if (typeof val === 'object' && !Array.isArray(val)) {
      Object.keys(val).forEach(k => { val[k] = this.recurseInstantiate(val[k]); });
      return val;
    }
    return val;
  }

  flattenObj(source, to, newKey) {
    for (const key of Object.keys(source)) {
      const combineKey = newKey ? `${newKey}.${key}` : key;
      if (typeof source[key] === "object" && !Array.isArray(source[key])) {
        this.flattenObj(source[key], to, combineKey);
        continue;
      }
      to[combineKey] = source[key];
    }
  }
}
module.exports = Utils;
