'use strict'

const google = require('googleapis')
const calendar = google.calendar('v3')

const { flatten, any } = require(`${__dirname}/helpers`)

module.exports = updateExistingEvents

function updateExistingEvents (allCalendars) {
  return function (auth) {
    return Promise.resolve(allCalendars)
      .then(filterEvents)
      .then(updateEvents(auth))
      .catch(console.log)
  }
}

function filterEvents ([ allOtherCalendars, primaryCalendar ]) {
  let primaryIds = primaryCalendar.map(x => x.id)
  let oneCal = flatten(allOtherCalendars)
  console.log('others:')
  oneCal.map(x => console.log(x.summary, x.start, x.end))
  console.log('primary:')
  primaryCalendar.map(x => console.log(x.summary, x.start, x.end))
  return oneCal.filter((cal) => {
    let i = primaryIds.indexOf(cal.id)
    let ev = primaryCalendar[i]
    let keys = Object.keys(ev)
    let attrs = ['status', 'summary', 'description', 'location', 'start', 'end']
    let filteredKeys = keys.filter(key => attrs.indexOf(key) !== -1)
    return filteredKeys.map(key => {
      if (key !== 'start' && key !== 'end') {
        return cal[key] !== ev[key]
      } else {
        return cal[key].dateTime !== ev[key].dateTime
      }
    }).reduce(any)
  })
}

function updateEvents (auth) {
  return function (changedEvents) {
    console.log('events to update:', changedEvents)
    return changedEvents.map(updateEvent(auth))
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
    .catch(console.log)
  }
}
