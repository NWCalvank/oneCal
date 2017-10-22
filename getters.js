'use strict'

const fs = require('fs')
const google = require('googleapis')
const calendar = google.calendar('v3')

module.exports = {
  getAllCalendarsAndEvents,
  getCalendar
}

function getAllCalendarsAndEvents (auth) {
  return function (path) {
    let calendarIds = getAllCalendars(path)
    return Promise.all(calendarIds.map(getCalendar(auth)))
                  .catch(console.log)
  }
}

function getAllCalendars (path) {
  let data = fs.readFileSync(path)
  return JSON.parse(data).calendarIds
}

function getCalendar (auth) {
  return function (id) {
    return new Promise((resolve, reject) => {
      calendar.events.list({
        auth: auth,
        calendarId: id,
        timeMin: (new Date()).toISOString()
      }, function (err, res) {
        if (err) { reject(err) } else { resolve(res.items) }
      })
    })
    .catch(console.log)
  }
}
