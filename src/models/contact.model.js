class Contact {
    constructor(etag, first_name, last_name, email, phone, organization) {
        if (!arguments.length) {

        } else {
            this.etag = etag
            this.first_name = first_name
            this.last_name = last_name
            this.email = email
            this.phone = phone
            this.organization = organization
        }
    }

    contact(googleContact) {
        var id = googleContact.resourceName
        id = id.replace('people/', '')

        var dbContact = {
            'id': id,
            'etag': googleContact.etag,
            'first_name': googleContact.names[0].givenName,
            'last_name': googleContact.names[0].familyName,
            'email': googleContact.emailAddresses[0].value,
            'phone': googleContact.phoneNumbers[0].value,
            'organization': googleContact.organizations[0].name
        }

        return dbContact
    }

    get googleContact() {
        var contact = {
            'etag': this.etag,
            'names': [
                {
                    'givenName': this.first_name,
                    'familyName': this.last_name
                }
            ],
            'emailAddresses': [
                {
                    'value': this.email
                }
            ],
            'phoneNumbers': [
                {
                    'value': this.phone,
                    'type': 'home',
                    'formattedType': 'home'
                }
            ],
            'organizations': [
                {
                    'name': this.organization
                }
            ]
        };

        return contact
    }
}

module.exports = Contact