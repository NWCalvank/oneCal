'use strict'

const fs = require('fs')
const authorize = require(`${__dirname}/authorize`)
const google = require('googleapis')
const calendar = google.calendar('v3')

initialize()

// copy new events to primary -- done
// update existing events on primary if they've changed
// optional: delete events on primary that don't exist on other calendars

function initialize () {
  let authToken = authorize()
  Promise.all([
    authToken.then(auth => getAllCalendarsAndEvents(auth)(`${__dirname}/private_data.json`)).catch(console.log),
    authToken.then(auth => getCalendar(auth)('primary')).catch(console.log)
  ])
  .then(filterEvents)
  .then(function (newEvents) { return authToken.then(auth => copyEvents(auth)(newEvents)) })
  .then(successMessage)
  .catch(console.log)
}

function successMessage (dataArr) {
  dataArr.map(promise => {
    promise.then(data => console.log(`The script completed with the following update: ${data}`))
  })
}

function flatten (arr) {
  return arr.reduce((arr1, arr2) => {
    return arr1.concat(arr2)
  }, [])
}

function filterEvents ([ allOtherCalendars, primaryCalendar ]) {
  let primaryIds = primaryCalendar.map(x => x.id)
  let oneCal = flatten(allOtherCalendars)
  return oneCal.filter((cal) => primaryIds.indexOf(cal.id) === -1)
}

function copyEvents (auth) {
  return function (newEvents) {
    return newEvents.map(copyEvent(auth))
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
