'use strict'

module.exports = {
  flatten,
  any
}

function flatten (arr) {
  return arr.reduce((arr1, arr2) => {
    return arr1.concat(arr2)
  }, [])
}

function any (acc, val) {
  return acc || val
}
