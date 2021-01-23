const router = require('express').Router()
const axios = require('axios')

const gapiController = require('../controllers/gapi.controller')
const calendar = gapiController.getGoogleCalendar()

var Event = require('../models/event.model')

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./localDbStorage');
}

uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

router.post('/subscription', (req, res) => {
    var body = req.body

    const uuid = uuidv4()
    const webhookUrl = `https://${body.webhook_url}/webhook/notifications`

    var requestBody = {}

    if (body.sync_exists === "false") {

        requestBody = {
            id: uuid,
            token: "syncpocsecret",
            type: "web_hook",
            address: webhookUrl,
            params: {
                ttl: "604801"
            }
        }

        calendar.events.watch({
            calendarId: 'primary',
            singleEvents: true,
            orderBy: 'startTime',
            resource: requestBody,
        }, function (err, response) {
            if (err && err.code) {
                return console.error('Error while subscribing to push notifications is - error code - ', err.code, ' - error is ', err.errors)
            }

            if (response.status == 200 && response.statusText == 'OK') {
                var subscriptionData = {
                    subscriptionDomainUrl: body.webhook_url,
                    subscriptionPushNotifications: response.data
                }

                localStorage.setItem('push-subscription-data', JSON.stringify(subscriptionData))

                res.redirect('/')
            }
        })
    } else {
        var subscriptionData = JSON.parse(localStorage.getItem('push-subscription-data') || '{}')

        requestBody = {
            id: subscriptionData.subscriptionPushNotifications.id,
            resourceId: subscriptionData.subscriptionPushNotifications.resourceId
        }

        var PUSH_NOTIFICATION_STOP = 'https://www.googleapis.com/calendar/v3/channels/stop'
        var accessToken = gapiController.getAccessToken()

        axios.post(PUSH_NOTIFICATION_STOP, requestBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }).then(result => {
            if (result.status == 204) {
                console.log('subscription deleted!')
                localStorage.setItem('push-subscription-data', '{}')
                localStorage.removeItem('sync-token')

                res.redirect('/')
            } else {
                console.log('subscription not found')

                res.redirect('/')
            }

        }).catch(err => {
            console.error("Error while stopping notifications is ", err.response.data)
        })
    }
    
})

router.post('/notifications', (req, res) => {
    var body = req.body;

    console.log(body)
    console.log(JSON.stringify(req.headers))

    var resourceState = req.headers["x-goog-resource-state"]

    realTimeSync(resourceState)

    res.sendStatus(202)
})

realTimeSync = (resourceState) => {
    var eventObject = new Event()
    var syncToken = localStorage.getItem('sync-token') || null
    if (syncToken == null && resourceState == 'sync') {
        calendar.events.list({
            calendarId: 'primary',
            singleEvents: true,
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ', err.message)

            if (res.data.nextSyncToken) {
                localStorage.setItem("sync-token", res.data.nextSyncToken)
            }

            events = res.data.items
            if (events.length) {
                console.log('Performing full initial sync!')
                var localEvents = []
                events.forEach(event => {
                    localEvents.push(eventObject.event(event))
                });

                localStorage.setItem('events', JSON.stringify(localEvents))
            } else {
                console.log('No events found to sync')
            }
        })
    } else {
        if (resourceState == 'exists') {
            // get the next sync token and update it
            var nextSyncToken = localStorage.getItem('sync-token')
            calendar.events.list({
                calendarId: 'primary',
                singleEvents: true,
                syncToken: nextSyncToken,
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ', err.message)

                if (res.data.nextSyncToken) {
                    localStorage.setItem("sync-token", res.data.nextSyncToken)
                }

                events = res.data.items
                if (events.length) {
                    console.log('Performing incremental sync!')
                    var localEvents = JSON.parse(localStorage.getItem('events') || '[]')
                    events.forEach(event => {
                        if (event.status == "confirmed") {
                            var findIndex = localEvents.findIndex(ev => ev.id === event.id)
                            if (findIndex == -1) {
                                console.log("status confirmed new created");
                                localEvents.push(eventObject.event(event))
                            } else {
                                console.log("status confirmed updated")
                                localEvents[findIndex] = eventObject.event(event)
                            }

                        } else if (event.status == "cancelled") {
                            console.log("status event cancelled")
                            localEvents = localEvents.filter((evnt) => evnt.id !== event.id)
                        }

                    });

                    localStorage.setItem('events', JSON.stringify(localEvents))
                } else {
                    console.log('No events found to sync')
                }
            })
        }
    }
}

module.exports = router