'use strict'

const fs = require('fs')

module.exports = logError

function logError (err) {
  let content = `${Date()} - ${err}\n`
  fs.appendFileSync(`${__dirname}/errorLog.txt`, content)
}
