const router = require('express').Router()
const LocalSyncStorage = require('node-localstorage').LocalStorage
const Contact = require('../models/contact.model')
const gapiController = require('../controllers/gapi.controller')
const contactApi = gapiController.getGoogleContact()
const sleep = require('sleep')

var localSync
if (typeof (localSync) === undefined || localSync == null) {
    localSync = new LocalSyncStorage('./localDbSync')
}

router.get('/', (req, res) => {
    var contacts = JSON.parse(localSync.getItem('contacts') || '[]')

    res.render('pages/contactSyncAll', { contacts })
})

router.get('/sync', async (req, res) => {
    var contacts = JSON.parse(localSync.getItem('contacts') || '[]')

    contacts.forEach(async (contact) => {
        var contactObj = Object.assign(new Contact(), contact)

        // console.log(contactObj)
        
        sleep.sleep(1) // use this if api rate limit exceeded
        await contactApi.people.createContact({ personFields: 'names,emailAddresses,organizations,phoneNumbers', resource: contactObj.googleContact})
        
    })

    res.redirect('/contactsyncall')
})


module.exports = router