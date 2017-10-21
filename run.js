'use strict'

const fs = require('fs')
const authorize = require(`${__dirname}/authorize`)
const google = require('googleapis')
const calendar = google.calendar('v3')

initialize()

// list of events on primary
// list ofiidd events on other calendars
// filter other calendar lists to only those events not in primary
// copy these new events to primary

function initialize () {
  authorize().then(function (auth) {
    getAllCalendarsAndEvents(auth)
    .then(copyEvents(auth))
    .then(_ => console.log('done'))
    .catch(console.log)
  })
}

function copyEvents (auth) {
  return function (allCalendars) {
    return allCalendars.map(function (events) {
      return events.map(copyEvent(auth))
    })
  }
}

function copyEvent (auth) {
  return function (e) {
    return new Promise((resolve, reject) => {
      calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: e
      }, function (err, res) {
        if (err) { reject(err) } else { resolve(res) }
      })
    })
    .catch(console.log)
  }
}

function getAllCalendarsAndEvents (auth) {
  let calendarIds = getAllCalendars(`${__dirname}/private_data.json`)
  return Promise.all(calendarIds.map(getCalendar(auth)))
                .catch(console.log)
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
