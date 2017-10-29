'use strict'

const google = require('googleapis')
const calendar = google.calendar('v3')
const logError = require(`${__dirname}/logError`)

const { flatten } = require(`${__dirname}/helpers`)

module.exports = deleteCancelledEvents

function deleteCancelledEvents (allCalendars) {
  return function (auth) {
    return Promise.resolve(allCalendars)
      .then(filterEvents)
      .then(deleteEvents(auth))
      .catch(logError)
  }
}

function filterEvents ([ allOtherCalendars, primaryCalendar ]) {
  let oneCal = flatten(allOtherCalendars)
  let eventIds = oneCal.map(x => x.id)
  return primaryCalendar.filter(onlyCancelledEvents(eventIds))
}

function onlyCancelledEvents (eventIds) {
  return function (primary) {
    return eventIds.indexOf(primary.id) === -1
  }
}

function deleteEvents (auth) {
  return function (cancelledEvents) {
    let deletedEvents = cancelledEvents.map(deleteEvent(auth))
    return Promise.all(deletedEvents)
  }
}

function deleteEvent (auth) {
  return function (e) {
    return new Promise((resolve, reject) => {
      calendar.events.delete({
        auth: auth,
        calendarId: 'primary',
        eventId: e.id
      }, function (err, res) {
        if (err) { reject(err) } else { resolve(res) }
      })
    })
  }
}
