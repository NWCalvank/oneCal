'use strict'

const google = require('googleapis')
const calendar = google.calendar('v3')
const logError = require(`${__dirname}/logError`)

const { flatten } = require(`${__dirname}/helpers`)

module.exports = copyNewEventsToPrimary

function copyNewEventsToPrimary (allCalendars) {
  return function (auth) {
    return Promise.resolve(allCalendars)
      .then(filterEvents)
      .then(copyEvents(auth))
      .catch(logError)
  }
}

function filterEvents ([ allOtherCalendars, primaryCalendar ]) {
  let primaryIds = primaryCalendar.map(x => x.id)
  let iCalUIds = primaryCalendar.map(x => x.iCalUID)
  let allIds = [...primaryIds, ...iCalUIds]
  let oneCal = flatten(allOtherCalendars)
  return oneCal.filter(onlyNewEvents(allIds))
}

function onlyNewEvents (allIds) {
  return function (primary) {
    return allIds.indexOf(primary.id) === -1 &&
           allIds.indexOf(primary.iCalUID) === -1
  }
}

function copyEvents (auth) {
  return function (newEvents) {
    let createdEvents = newEvents.map(copyEvent(auth))
    return Promise.all(createdEvents)
  }
}

function copyEvent (auth) {
  return function (e) {
    if (e.iCalUID !== undefined) { delete e.id }
    return new Promise((resolve, reject) => {
      calendar.events.insert({
        auth: auth,
        calendarId: 'primary',
        resource: e
      }, function (err, res) {
        if (err) { reject(err) } else { resolve(res) }
      })
    })
  }
}
