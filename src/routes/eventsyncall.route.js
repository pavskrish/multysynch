const router = require('express').Router()
const LocalSyncStorage = require('node-localstorage').LocalStorage
const Event = require('../models/event.model')
const gapiController = require('../controllers/gapi.controller')
const calendar = gapiController.getGoogleCalendar()
const sleep = require('sleep')

var localSync
if (typeof (localSync) === undefined || localSync == null) {
    localSync = new LocalSyncStorage('./localDbSync')
}

router.get('/', (req, res) => {
    var events = JSON.parse(localSync.getItem('events') || '[]')

    res.render('pages/eventSyncAll', { events })
})

router.get('/sync', async (req, res) => {
    var events = JSON.parse(localSync.getItem('events') || '[]')

    events.forEach(async (event) => {
        var eventObj = Object.assign(new Event(), event)
        eventObj.participants = [eventObj.participants]

        // console.log(eventObj)

        sleep.sleep(1) // use this if api rate limit exceeded
        await calendar.events.insert({ calendarId: 'primary', resource: eventObj.googleEvent})
        
    })

    res.redirect('/eventsyncall')
})



module.exports = router