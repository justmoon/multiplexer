# Multiplexer CLI tool

Takes a filename as an argument. It will then treat each line from this file as a command and spawn a process with it. Finally it will multiplex the output of each of those processes, prefixing each line with the PID of that process.

# Installation

``` sh
npm install -g multiplexer
```

# Usage

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
