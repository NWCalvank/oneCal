'use strict'

const authorize = require(`${__dirname}/authorize`)
const config = require(`${__dirname}/config.json`)
const copyNewEventsToPrimary = require(`${__dirname}/copyNewEvents`)
const deleteCancelledEvents = require(`${__dirname}/deleteEvents`)
const logError = require(`${__dirname}/logError`)
const updateExistingEvents = require(`${__dirname}/updateEvents`)

const {
  getAllCalendarsAndEvents,
  getCalendar
} = require(`${__dirname}/getters`)

const { flatten } = require(`${__dirname}/helpers`)

const mainAuthToken = authorize('main')

!(function initialize () {
  let users = Object.keys(config)
  Promise.all(users.map(syncToMainCalendar))
    .then(function (everyCalendar) {
      let nestedOtherCalendars = everyCalendar.map(xs => xs[0])
      let primaryCalendar = everyCalendar[0][1]
      let allOtherCalendars = flatten(nestedOtherCalendars)
      return mainAuthToken.then(deleteCancelledEvents([allOtherCalendars, primaryCalendar]))
                          .then(successMessage('deleted'))
    })
    .catch(logError)
})()

function syncToMainCalendar (user) {
  let authToken = user === 'main' ? mainAuthToken : authorize(user)
  return Promise.all([authToken, mainAuthToken])
    .then(fetchData(user))
    .then(updateData)
    .catch(logError)
}

// fetchData :: String -> Promise { [Object] }
function fetchData (user) {
  return function ([ auth, mainAuth ]) {
    return Promise.all([
      // get all data for current user
      getAllCalendarsAndEvents(auth)(`${__dirname}/config.json`, user),
      // always get the primary calendar for the main user
      getCalendar(mainAuth)('primary')
    ])
    .catch(logError)
  }
}

// updateData :: Promise -> [Object] -> Promise { }
function updateData (allCalendars) {
  return Promise.all([
    mainAuthToken.then(copyNewEventsToPrimary(allCalendars)).then(successMessage('created')),
    mainAuthToken.then(updateExistingEvents(allCalendars)).then(successMessage('updated'))
  ])
  .then(_ => allCalendars)
  .catch(function (err) {
    logError(err)
    return allCalendars
  })
}

// successMessage :: [[Promise]] -> void
function successMessage (state) {
  return function (dataArr) {
    if (dataArr === undefined) {
      console.log('The server rejected one or more actions')
    } else if (dataArr.length !== 0) {
      dataArr.map(promise => {
        promise.then(data => console.log(`The following event has been ${state}: ${data.summary}`))
      })
    } else {
      console.log(`No events ${state}`)
    }
  }
}
