'use strict'

module.exports = {
  flatten,
  any,
  isInArray
}

function flatten (arr) {
  return arr.reduce((arr1, arr2) => {
    return arr1.concat(arr2)
  }, [])
}

function any (acc, val) {
  return acc || val
}

function isInArray (arr) {
  return function (elem) {
    return arr.indexOf(elem) !== -1
  }
}
