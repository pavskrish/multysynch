const express = require('express')

const bodyParser = require('body-parser')
const fs = require('fs');
const key = fs.readFileSync('./key.pem');
const cert = fs.readFileSync('./cert.pem');
const https = require('https');
const app = express()
const server = https.createServer({key: key, cert: cert }, app);

const gapi = require('./src/controllers/gapi.controller')
const ecRoutes = require('./src/routes/index')

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./localDbStorage');
}


app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', ecRoutes)

app.get('/', (_, res) => {
    var gmailAuthCb = (userinfo) => {
        var pushNotificationData = JSON.parse(localStorage.getItem('push-subscription-data') || '{}')
        var isSyncExists = false

        if (pushNotificationData.subscriptionDomainUrl) {
            isSyncExists = true
        }
        console.log(pushNotificationData)
        console.log(isSyncExists)

        res.render('pages/homepage', { user: userinfo.data, subscriptionData: pushNotificationData, isSyncExists: isSyncExists })
    }

    gapi.getUserInfo(gmailAuthCb)
})

app.get('/error', (_, res) => {
    res.send("error while logging in ")
})

const port = process.env.port || 3030

//app.listen(port, () => console.log("App running on port " + port))
server.listen(port, () => { console.log('listening on 3030') });