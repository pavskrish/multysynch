const { google } = require('googleapis')
const fs = require('fs')

const TOKEN_PATH = 'src/credentials/token.json'
const CREDENTIALS_PATH = 'src/credentials/credentials.json'

var oAuth2Client = null
var googleCalendar = null
var googleContact = null

var getOAuth2Client = () => {
    try {
        var credentials = fs.readFileSync(CREDENTIALS_PATH)
        credentials = JSON.parse(credentials)

    } catch (err) {
        return console.error('Error while retrieving credentials ', err.message)
    }

    const { client_secret, client_id, redirect_uris } = credentials.web

    if (oAuth2Client == null) {
        oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]
        )

        try {
            var token;
            token = fs.readFileSync(TOKEN_PATH)
            token = JSON.parse(token)

            var dateNow = new Date()
            dateNow = dateNow.getTime()

            // refresh token if expiry_date of token is finished
            if (token.expiry_date < dateNow) {
                oAuth2Client.on('tokens', (tokens) => {
                    if (tokens.access_token) {
                        token.access_token = tokens.access_token
                        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token))
                    }
                });
            }

            oAuth2Client.setCredentials(token)
        } catch (err) {
            console.error('Error while retrieving credentials ', err.message)
        }
    }

    return oAuth2Client
}

exports.getAccessToken = () => {
    var accessToken = ''
    try {
        var credentials = fs.readFileSync(TOKEN_PATH)
        credentials = JSON.parse(credentials)

        accessToken = credentials.access_token

    } catch (err) {
        return console.error('Error while retrieving credentials ', err.message)
    }

    return accessToken
}

exports.getUserInfo = (callback) => {
    getOAuth2Client()

    const googleOauth2 = google.oauth2({version: 'v2', auth: oAuth2Client})

    googleOauth2.userinfo.v2.me.get({
        auth: oAuth2Client
    },(err, res) => {
        if (err) return console.error('Error while retrieving user info ', err.message)

        callback(res)
    })
}

exports.getGoogleCalendar = () => {
    getOAuth2Client()

    if (googleCalendar == null) {
        googleCalendar = google.calendar({ version: 'v3', auth: oAuth2Client })
    }
    //console.log(googleCalendar)
    return googleCalendar
}

exports.getGoogleContact = () => {
    getOAuth2Client()

    if (googleContact == null) {
        googleContact = google.people({ version: 'v1', auth: oAuth2Client })
    }

    return googleContact
}