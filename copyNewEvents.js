'use strict'

const google = require('googleapis')
const calendar = google.calendar('v3')

const { flatten } = require(`${__dirname}/helpers`)

module.exports = copyNewEventsToPrimary

function copyNewEventsToPrimary (allCalendars) {
  return function (auth) {
    return Promise.resolve(allCalendars)
      .then(filterEvents)
      .then(copyEvents(auth))
      .catch(console.log)
  }
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
