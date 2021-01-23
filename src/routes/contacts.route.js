const router = require('express').Router()

const contactsController = require('../controllers/contacts.controller')
const Contact = require('../models/contact.model')


router.get('/list', (req, res) => {
    var contactsCb = (contacts) => {
        res.render('pages/contactListLocal', { contacts: contacts })
    }

    contactsController.listContactsLocal(contactsCb)
})

router.post('/create', (req, res) => {
    const contactBody = req.body

    var contact = new Contact(
        '',
        contactBody.first_name,
        contactBody.last_name,
        contactBody.email,
        contactBody.phone,
        contactBody.organization
    )

    var contactsCb = () => {
        res.redirect(req.get('referer'))
    }

    contactsController.createContact(contact.googleContact, contactsCb)
})

router.post('/update', (req, res) => {
    var contactBody = req.body

    var contact = new Contact(
        contactBody.etag,
        contactBody.first_name,
        contactBody.last_name,
        contactBody.email,
        contactBody.phone,
        contactBody.organization
    )

    var contactsCb = () => {
        res.redirect(req.get('referer'))
    }

    contactsController.updateContact(contactBody.contact_id, contact.googleContact, contactsCb)
})

router.get('/delete', (req, res) => {
    const contactId = req.query.contactId;
    contactsController.deleteContact(contactId)

    res.send({ message: 'Contact Deleted!' })
})

module.exports = router;