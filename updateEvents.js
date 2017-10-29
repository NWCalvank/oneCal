'use strict'

const google = require('googleapis')
const calendar = google.calendar('v3')
const logError = require(`${__dirname}/logError`)

const { flatten, any, isInArray } = require(`${__dirname}/helpers`)

module.exports = updateExistingEvents

function updateExistingEvents (allCalendars) {
  return function (auth) {
    return Promise.resolve(allCalendars)
      .then(filterEvents)
      .then(updateEvents(auth))
      .catch(logError)
  }
}

function filterEvents ([ allOtherCalendars, primaryCalendar ]) {
  let primaryIds = primaryCalendar.map(x => x.id)
  let oneCal = flatten(allOtherCalendars)
  return oneCal.filter(onlyChangedEvents(primaryIds, primaryCalendar))
}

function onlyChangedEvents (primaryIds, primaryCalendar) {
  return function (cal) {
    let i = primaryIds.indexOf(cal.id)
    let ev = i !== -1 ? primaryCalendar[i] : {}
    let keys = Object.keys(ev)
    let attrs = ['status', 'summary', 'description', 'location', 'start', 'end']
    let filteredKeys = keys.filter(isInArray(attrs))
    return filteredKeys.map(key => {
      if (key !== 'start' && key !== 'end') {
        return cal[key] !== ev[key]
      } else {
        return cal[key].dateTime !== ev[key].dateTime
      }
    })
    .reduce(any, false)
  }
}

function updateEvents (auth) {
  return function (changedEvents) {
    let updatedEvents = changedEvents.map(updateEvent(auth))
    return Promise.all(updatedEvents)
  }
}

function updateEvent (auth) {
  return function (e) {
    return new Promise((resolve, reject) => {
      calendar.events.update({
        auth: auth,
        calendarId: 'primary',
        eventId: e.id,
        resource: e
      }, function (err, res) {
        if (err) { reject(err) } else { resolve(res) }
      })
    })
  }
}
