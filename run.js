'use strict'

// const fs = require('fs')
// const google = require('googleapis')
// const calendar = google.calendar('v3')

const authorize = require(`${__dirname}/authorize`)
const {
  getAllCalendarsAndEvents,
  getCalendar
} = require(`${__dirname}/getters`)
const copyNewEventsToPrimary = require(`${__dirname}/copyNewEvents`)

const { flatten } = require(`${__dirname}/helpers`)

initialize()

// copy new events to primary -- done
// update existing events on primary if they've changed
// optional: delete events on primary that don't exist on other calendars

function initialize () {
  let authToken = authorize()
  authToken
  .then(fetchData)
  .then(updateData(authToken))
  .then(flatten)
  .then(successMessage)
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
      authToken.then(copyNewEventsToPrimary(allCalendars))
      // authToken.then(updateExistingEvents(allCalendars))
    ])
  }
}

// successMessage :: [[Promise]] -> void
function successMessage (dataArr) {
  if (dataArr.length !== 0) {
    dataArr.map(promise => {
      promise.then(data => console.log(`The script completed with the following update: ${data}`))
    })
  } else {
    console.log('No events added or updated')
  }
}
