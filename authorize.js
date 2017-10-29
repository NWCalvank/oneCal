let fs = require('fs')
let readline = require('readline')
let GoogleAuth = require('google-auth-library')

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
let SCOPES = ['https://www.googleapis.com/auth/calendar']

function tokenDir (user) {
  return `${__dirname}/users/${user}/.credentials/`
}

function tokenPath (user) {
  return `${tokenDir(user)}authorization.json`
}

function readFilePromise (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, function (err, res) {
      if (err) {
        reject('Error loading client secret file: ' + err)
      } else {
        resolve(res)
      }
    })
  })
}

// Load client secrets from a local file.
function initialize (user) {
  return readFilePromise(`${__dirname}/client_secret.json`)
         .then(authorize(user))
         .catch(console.log)
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize (user) {
  return function (data) {
    let credentials = JSON.parse(data)
    let clientSecret = credentials.installed.client_secret
    let clientId = credentials.installed.client_id
    let redirectUrl = credentials.installed.redirect_uris[0]
    let auth = new GoogleAuth()
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

    // Check if we have previously stored a token.
    return readFilePromise(tokenPath(user))
           .then(getExistingToken)
           .catch(getNewToken(oauth2Client, user))

    function getExistingToken (token) {
      oauth2Client.credentials = JSON.parse(token)
      return oauth2Client
    }
  }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken (oauth2Client, user) {
  return function () {
    let authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    })
    console.log('Authorize this app by visiting this url: ', authUrl)
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question('Enter the code from that page here: ', function (code) {
      rl.close()
      oauth2Client.getToken(code, function (err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err)
        } else {
          oauth2Client.credentials = token
          storeToken(token, user)
          return oauth2Client
        }
      })
    })
  }
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken (token, user) {
  try {
    fs.mkdirSync(tokenDir(user))
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
  fs.writeFile(tokenPath(user), JSON.stringify(token), successMessage(user))
}

function successMessage (user) {
  return function () {
    console.log(`Token stored to ${tokenPath(user)}`)
  }
}

module.exports = initialize
