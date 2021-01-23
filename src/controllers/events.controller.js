const gapiController = require('./gapi.controller')
const calendar = gapiController.getGoogleCalendar()

const Event = require('../models/event.model')

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./localDbStorage');
}

exports.listEventsLocal = (callback) => {
    const events = JSON.parse(localStorage.getItem('events'))
    callback(events)
}

exports.listEvents = (callback) => {
    calendar.events.list({
        calendarId: 'primary',
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ', err.message)

        events = res.data.items
        if (events.length) {
            console.log('upcoming 10 events')
            callback(events)
            // events.map((event, i) => {
            //     console.log(event)
            // })
        } else {
            console.log('No upcoming events found')
            callback(events)
        }
    })
}

exports.insertEvent = (eventParam, callback) => {
    var event = new Event()

    calendar.events.insert({
        calendarId: 'primary',
        resource: eventParam,
    }, function (err, insertedEvent) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }

        var events = JSON.parse(localStorage.getItem('events') || '[]')
        events.push(event.event(insertedEvent.data))

        localStorage.setItem('events', JSON.stringify(events))
        callback()
    })
}

exports.updateEvent = (eventId, eventUpdate, callback) => {
    var event = new Event()

    calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: eventUpdate
    }, function (err, updatedEvent) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }

        var events = JSON.parse(localStorage.getItem('events') || '[]')
        
        var findIndex = events.findIndex(ev => ev.id === updatedEvent.data.id)
        
        events[findIndex] = event.event(updatedEvent.data)
        // console.log(events)

        localStorage.setItem('events', JSON.stringify(events))
        callback()
    })


}

exports.deleteEvent = (eventId) => {
    calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
    }, function (err, deletedEvent) {
        if (err) {
            console.log('There was an error contacting the Calendar service: ' + err);
            return;
        }

        var events = JSON.parse(localStorage.getItem('events') || '[]')
        events = events.filter((item) => item.id !== eventId)

        localStorage.setItem('events', JSON.stringify(events))
    })
}