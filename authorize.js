const run = function (fn) {
  let fs = require('fs')
  let readline = require('readline')
  // let google = require('googleapis')
  let GoogleAuth = require('google-auth-library')

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
  let SCOPES = ['https://www.googleapis.com/auth/calendar']
  let TOKEN_DIR = `${__dirname}/.credentials/`
  let TOKEN_PATH = `${TOKEN_DIR}authorization.json`

  // Load client secrets from a local file.
  fs.readFile(`${__dirname}/client_secret.json`, processClientSecrets)

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
  function authorize (credentials, callback) {
    let clientSecret = credentials.installed.client_secret
    let clientId = credentials.installed.client_id
    let redirectUrl = credentials.installed.redirect_uris[0]
    let auth = new GoogleAuth()
    let oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl)

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, checkForExistingToken)

    function checkForExistingToken (err, token) {
      if (err) {
        getNewToken(oauth2Client, callback)
      } else {
        oauth2Client.credentials = JSON.parse(token)
        callback(oauth2Client)
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
  function getNewToken (oauth2Client, callback) {
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
          storeToken(token)
          callback(oauth2Client)
        }
      })
    })
  }

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
  function storeToken (token) {
    try {
      fs.mkdirSync(TOKEN_DIR)
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token))
    console.log('Token stored to ' + TOKEN_PATH)
  }

  function processClientSecrets (err, content) {
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    if (err) { console.log('Error loading client secret file: ' + err) } else { authorize(JSON.parse(content), fn) }
  }
}

module.exports = run
