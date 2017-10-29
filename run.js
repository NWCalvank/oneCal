'use strict'

const authorize = require(`${__dirname}/authorize`)
const copyNewEventsToPrimary = require(`${__dirname}/copyNewEvents`)
const updateExistingEvents = require(`${__dirname}/updateEvents`)
const config = require(`${__dirname}/config.json`)

const {
  getAllCalendarsAndEvents,
  getCalendar
} = require(`${__dirname}/getters`)

let users = Object.keys(config)

users.forEach(initialize)

function initialize (user) {
  let authToken = authorize(user)
  let mainAuthToken = user === 'main' ? authToken : authorize('main')
  Promise.all([authToken, mainAuthToken])
    .then(fetchData(user))
    .then(updateData(mainAuthToken))
    .catch(console.log)
}

// fetchData :: String -> Promise { [Object] }
function fetchData (user) {
  return function ([ auth, mainAuth ]) {
    return Promise.all([
      // get all data for current user
      getAllCalendarsAndEvents(auth)(`${__dirname}/config.json`, user),
      // always get the primary calendar for the main users
      getCalendar(mainAuth)('primary')
    ])
    .catch(console.log)
  }
}

// updateData :: Promise -> [Object] -> Promise { }
function updateData (authToken) {
  return function (allCalendars) {
    return Promise.all([
      authToken.then(copyNewEventsToPrimary(allCalendars)).then(successMessage('created')),
      authToken.then(updateExistingEvents(allCalendars)).then(successMessage('updated'))
    ])
    .catch(console.log)
  }
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
