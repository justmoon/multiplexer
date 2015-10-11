'use strict'

const byline = require('byline')
const through2 = require('through2')
const spawn = require('child_process').spawn

function Multiplexer (opts) {
  if (Array.isArray(opts)) {
    opts = {
      commands: opts
    }
  } else if (!opts) {
    opts = {}
  }

  this.commands = opts.commands || []
  this.stdout = opts.stdout || process.stdout
  this.stderr = opts.stderr || process.stderr
  this.spawnInterval = opts.spawnInterval || 300
}

Multiplexer.prototype.start = function () {
  const self = this

  // Increase event emitter limits
  self.stdout.setMaxListeners(0)
  self.stderr.setMaxListeners(0)

  let interval = setInterval(function () {
    if (!self.commands.length) {
      clearInterval(interval)
      return
    }
    let unit = self.commands.shift()
    if (typeof unit === 'string') {
      unit = {
        cmd: unit
      }
    }
    const log = spawn('sh', ['-c', unit.cmd], {
      cwd: unit.cwd,
      env: unit.env,
      detached: unit.detached,
      uid: unit.uid,
      gid: unit.gid
    })
    byline(log.stdout).pipe(through2(function (line, enc, callback) {
      this.push('' + log.pid + ' ' + line.toString('utf-8') + '\n')
      callback()
    })).pipe(self.stdout)
    log.stderr.pipe(self.stderr)
  }, self.spawnInterval)
}

module.exports = Multiplexer