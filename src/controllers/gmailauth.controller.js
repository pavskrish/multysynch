const { google } = require('googleapis')
const fs = require('fs')

const CREDENTIALS_PATH = 'src/credentials/credentials.json'
const TOKEN_PATH = 'src/credentials/token.json'

const SCOPES = ['profile', 'email', 'https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/contacts']

var oAuth2Client

exports.generateAuthUrl = () => {
    try {
        var credentials = fs.readFileSync(CREDENTIALS_PATH)
        credentials = JSON.parse(credentials)

        const { client_secret, client_id, redirect_uris } = credentials.web
        oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]
        )

        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        })

        return authUrl
    } catch (err) {
        return console.error('Error loading client secret file:', err.message)
    }
}

exports.saveTokensFromCode = (code) => {
    oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err)
        oAuth2Client.setCredentials(token)
        
        if (token['refresh_token']) {
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
            });
        } else {
            fs.readFile(TOKEN_PATH, (err, existingToken) => {
                if (err) return console.error('Error while reading tokens', err.message)

                const access_token = token['access_token']
                existingToken.access_token = access_token

                fs.writeFile(TOKEN_PATH, JSON.stringify(existingToken), (err) => {
                    if (err) return console.error('Error while writing fresh access token ', err);
                });
            })
        }
    })
}