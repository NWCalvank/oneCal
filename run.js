'use strict'

const fs = require('fs')
const google = require('googleapis')
const calendar = google.calendar('v3')

const authorize = require(`${__dirname}/authorize`)
const copyNewEventsToPrimary = require(`${__dirname}/copyNewEvents`)

initialize()

// copy new events to primary -- done
// update existing events on primary if they've changed
// optional: delete events on primary that don't exist on other calendars

function initialize () {
  let authToken = authorize()
  authToken.then(copyNewEventsToPrimary)
  // authToken.then(updateExistingEvents)
  .then(successMessage)
  .catch(console.log)
}

function successMessage (dataArr) {
  dataArr.map(promise => {
    promise.then(data => console.log(`The script completed with the following update: ${data}`))
  })
}
