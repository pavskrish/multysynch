const router = require('express').Router()

const auth = require('./auth.route')
const events = require('./events.route')
const contacts = require('./contacts.route')

const webhook = require('./webhook.route')

router.use('/auth', auth)
router.use('/event', events)
router.use('/eventsyncall', require('./eventsyncall.route'))
router.use('/contact', contacts)
router.use('/contactsyncall', require('./contactsyncall.route'))

router.use('/webhook', webhook)

module.exports = router