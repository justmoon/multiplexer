#!/usr/bin/env node

'use strict'

const fs = require('fs')
const meow = require('meow')
const byline = require('byline')
const through2 = require('through2')
const spawn = require('child_process').spawn

const cli = meow({
  help: [
    'Usage',
    '  multiplexer <commandfile>'
  ].join('\n')
})

const commands = fs.readFileSync(cli.input[0], 'utf-8').split('\n')

// Increase event emitter limits
process.stdout.setMaxListeners(0)
process.stderr.setMaxListeners(0)

let interval = setInterval(function () {
  let unit = commands.shift()
  if (!unit) {
    // We're all done
    clearInterval(interval)
    return
  }
  const log = spawn('sh', ['-c', unit])
  byline(log.stdout).pipe(through2(function (line, enc, callback) {
    this.push('' + log.pid + ' ' + line.toString('utf-8') + '\n')
    callback()
  })).pipe(process.stdout)
  log.stderr.pipe(process.stderr)
}, 300)
