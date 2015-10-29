'use strict'

const byline = require('byline')
const through2 = require('through2')
const spawn = require('child_process').spawn
const chalk = require('chalk')

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
  this.colors = opts.colors || ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
}

Multiplexer.prototype.createStdoutProcessor = function (log, unit, cmdId) {
  const colorize = Array.isArray(this.colors) && this.colors.length
    ? chalk[this.colors[cmdId % this.colors.length]]
    : (val) => val
  return function (line, enc, callback) {
    this.push('' + colorize(unit.alias || log.pid) + ' ' + line.toString('utf-8') + '\n')
    callback()
  }
}

Multiplexer.prototype.createStderrProcessor = function (log, unit, cmdId) {
  return function (line, enc, callback) {
    this.push(line)
    callback()
  }
}

Multiplexer.prototype.start = function () {
  const self = this

  // Increase event emitter limits
  self.stdout.setMaxListeners(0)
  self.stderr.setMaxListeners(0)

  let cmdId = 0
  function spawnNext () {
    if (!self.commands.length) {
      return
    }
    cmdId++
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

    let processStdout
    if (unit.processStdout) {
      processStdout = unit.processStdout(log, unit, cmdId)
    } else {
      processStdout = self.createStdoutProcessor(log, unit, cmdId)
    }

    let processStderr
    if (unit.processStderr) {
      processStderr = unit.processStderr(log, unit, cmdId)
    } else {
      processStderr = self.createStderrProcessor(log, unit, cmdId)
    }

    byline(log.stdout).pipe(through2(function (line, enc, callback) {
      if (unit.waitFor && line.indexOf(unit.waitFor) !== -1) {
        unit.waitFor = null
        setTimeout(spawnNext, self.spawnInterval)
      }
      this.push(line)
      callback()
    })).pipe(through2(processStdout)).pipe(self.stdout)
    byline(log.stderr).pipe(through2(processStderr)).pipe(self.stderr)
    if (!unit.waitFor) {
      setTimeout(spawnNext, self.spawnInterval)
    }
  }
  spawnNext()
}

module.exports = Multiplexer
