#!/usr/bin/env node

'use strict'

const Multiplexer = require('./lib/multiplexer')

if (!module.parent) {
  require('./lib/cli')
} else {
  module.exports = function (commands) {
    const multiplexer = new Multiplexer(commands)
    return multiplexer.start()
  }

  module.exports.Multiplexer = Multiplexer
}
