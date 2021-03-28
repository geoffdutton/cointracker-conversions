#!/usr/bin/env node

const lib = require('../dist/index.js').default

lib(require('minimist')(process.argv.slice(2))).then((result) =>
  console.log('lib return value', result)
)
