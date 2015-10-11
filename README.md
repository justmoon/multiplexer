# Multiplexer CLI tool

Takes a filename as an argument. It will then treat each line from this file as a command and spawn a process with it. Finally it will multiplex the output of each of those processes, prefixing each line with the PID of that process.

# Usage (CLI)

``` sh
npm install -g multiplexer
```

``` sh
echo "\
while [ 1 ] ; do echo beep ; sleep 1 ; done
while [ 1 ] ; do echo boop ; sleep 1 ; done
while [ 1 ] ; do echo baap ; sleep 1 ; done" > example-commands

multiplexer example-commands
```

Output:

```
25242 beep
25244 boop
25246 baap
25242 beep
25244 boop
25246 baap
25242 beep
25244 boop
25246 baap
```

# Usage (as a module)

``` sh
npm install multiplexer
```

``` js
const multiplexer = require('multiplexer')

multiplexer([
  'while [ 1 ] ; do echo beep ; sleep 1 ; done',
  'while [ 1 ] ; do echo beep ; sleep 1 ; done',
  'while [ 1 ] ; do echo beep ; sleep 1 ; done'
])
```

Instead of a string, each command can be an object with the following fields:

* `cwd` ... Set working directory
* `env` ... Set of environment key-value pairs
* `uid` ... Run as User ID
* `gid` ... Run as Group ID
* `detached` ... Detach from parent process
* `alias` ... Custom log prefix (default: process id)
* `waitFor` ... Wait for process to print given string to stdout before spawning next process
