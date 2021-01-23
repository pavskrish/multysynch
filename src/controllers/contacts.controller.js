const gapiController = require('./gapi.controller')
const contactApi = gapiController.getGoogleContact()


const Contact = require('../models/contact.model')

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./localDbStorage');
}

exports.listContactsLocal = (callback) => {
    const contacts = JSON.parse(localStorage.getItem('contacts'))
    
    callback(contacts)
}

exports.listContacts = (callback) => {
    contactApi.people.connections.list({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses,organizations,phoneNumbers',
        pageSize: 100
    }, (err, res) => {
        if (err) return console.error('The API returned an error: ' + err)

        const connections = res.data.connections
        if (connections) {
            console.log('Connections List:');
            
            callback(connections)
        } else {
            console.log('No connections found.');
            callback([])
        }
    })
}

exports.createContact = (contactResource, callback) => {
    var contact = new Contact()
    
    contactApi.people.createContact({
        personFields: 'names,emailAddresses,organizations,phoneNumbers',
        resource: contactResource,
    }, (err, insertedContact) => {
        if (err) return console.log('There was an error contacting the Contacts service: ' + err)

        var contacts = JSON.parse(localStorage.getItem('contacts') || '[]')
        contacts.push(contact.contact(insertedContact.data))

        localStorage.setItem('contacts', JSON.stringify(contacts))
        callback()
    })
}

exports.updateContact = (contactId, contactUpdate, callback) => {
    var contact = new Contact()

    contactApi.people.updateContact({
        personFields: 'names,emailAddresses,organizations,phoneNumbers',
        resourceName: `people/${contactId}`,
        updatePersonFields: 'names,emailAddresses,organizations,phoneNumbers',
        requestBody: contactUpdate
    }, (err, updatedContact) => {
        if (err) return console.log('There was an error contacting the Contacts service: ' + err.message)

        var contacts = JSON.parse(localStorage.getItem('contacts') || '[]')
        
        const updateIndex = contacts.findIndex(c => c.id === `${contactId}`)
        
        contacts[updateIndex] = contact.contact(updatedContact.data)
        contacts[updateIndex].etag = updatedContact.data.etag
        
        localStorage.setItem('contacts', JSON.stringify(contacts))

        callback()
    })

}

exports.deleteContact = (contactId) => {
    contactApi.people.deleteContact({
        resourceName: `people/${contactId}`
    }, (err, deletedContact) => {
        if (err) return console.error('Error while deleting contact', err)

        var contacts = JSON.parse(localStorage.getItem('contacts') || '[]')
        contacts = contacts.filter((item) => item.id !== `${contactId}`)

        localStorage.setItem('contacts', JSON.stringify(contacts))
    })
}