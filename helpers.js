'use strict'

module.exports = {
  flatten
}

function flatten (arr) {
  return arr.reduce((arr1, arr2) => {
    return arr1.concat(arr2)
  }, [])
}
