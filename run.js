'use strict'

const authorize = require(`${__dirname}/authorize`)
const copyNewEventsToPrimary = require(`${__dirname}/copyNewEvents`)
const updateExistingEvents = require(`${__dirname}/updateEvents`)

const {
  getAllCalendarsAndEvents,
  getCalendar
} = require(`${__dirname}/getters`)

initialize()

function initialize () {
  let authToken = authorize()
  authToken
  .then(fetchData)
  .then(updateData(authToken))
  .catch(console.log)
}

// fetchData :: String -> Promise { [Object] }
function fetchData (auth) {
  return Promise.all([
    getAllCalendarsAndEvents(auth)(`${__dirname}/private_data.json`),
    getCalendar(auth)('primary')
  ])
}

// updateData :: Promise -> [Object] -> Promise { }
function updateData (authToken) {
  return function (allCalendars) {
    return Promise.all([
      authToken.then(copyNewEventsToPrimary(allCalendars)).then(successMessage('created')),
      authToken.then(updateExistingEvents(allCalendars)).then(successMessage('updated'))
    ])
  }
}

// successMessage :: [[Promise]] -> void
function successMessage (state) {
  return function (dataArr) {
    if (dataArr.length !== 0) {
      dataArr.map(promise => {
        promise.then(data => console.log(`The following event has been ${state}: ${data.summary}`))
      })
    } else {
      console.log(`No events ${state}`)
    }
  }
}
