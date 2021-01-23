const router = require('express').Router()

const eventsController = require('../controllers/events.controller')
const Event = require('../models/event.model')

router.get('/list', (req, res) => {
    var eventsCb = function eventsList(events) {
        res.render('pages/eventListLocal', { events: events })
    }

    eventsController.listEventsLocal(eventsCb)
})

router.post('/create', (req, res) => {
    const eventBody = req.body

    var event = new Event(
        eventBody.title,
        eventBody.description,
        eventBody.location,
        new Date(eventBody.start_time).toISOString().replace('Z', ''),
        new Date(eventBody.end_time).toISOString().replace('Z', ''),
        {
            'email': eventBody.organizer,
        },
        [eventBody.participants]
    )

    var eventsCb = () => {
        res.redirect(req.get('referer'))
    }

    eventsController.insertEvent(event.googleEvent, eventsCb)
})

router.post('/update', (req, res) => {
    var eventBody = req.body;

    var event = new Event(
        eventBody.title,
        eventBody.description,
        eventBody.location,
        new Date(eventBody.start_time).toISOString().replace('Z', ''),
        new Date(eventBody.end_time).toISOString().replace('Z', ''),
        {
            'email': eventBody.organizer,
        },
        [eventBody.participants]
    )

    var eventsCb = () => {
        res.redirect(req.get('referer'))
    }

    eventsController.updateEvent(eventBody.event_id, event.googleEvent, eventsCb)
})

router.get('/delete', (req, res) => {
    const eventId = req.query.eventId;
    eventsController.deleteEvent(eventId)

    res.send({ message: 'Event Deleted!' })
})


module.exports = router