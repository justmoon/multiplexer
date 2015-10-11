'use strict'

const fs = require('fs')
const meow = require('meow')
const Multiplexer = require('./multiplexer')

const cli = meow({
  help: [
    'Usage',
    '  multiplexer <commandfile>'
  ].join('\n')
})

const commands = fs.readFileSync(cli.input[0], 'utf-8').split('\n')

const multiplexer = new Multiplexer(commands)
multiplexer.start()
