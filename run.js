'use strict'

const fs = require('fs')
const authorize = require(`${__dirname}/authorize`)
const google = require('googleapis')
const calendar = google.calendar('v3')

initialize()

function initialize () {
  authorize()
  .then(getAllCalendars)
  .then(console.log)
}

function getAllCalendars (auth) {
  let data = fs.readFileSync(`${__dirname}/private_data.json`)
  let calendarIds = JSON.parse(data).calendarIds
  return Promise.all(calendarIds.map(getCalendar(auth))).catch(console.log)
}

function getCalendar (auth) {
  return function (id) {
    return new Promise((resolve, reject) => {
      calendar.events.list({
        auth: auth,
        calendarId: id
      }, function (err, res) {
        if (err) { reject(err) } else { resolve(res) }
      })
    })
  }
}
