class Event {
    constructor (title, description, location, start_time, end_time, organizer, participants) {
        if (!arguments.length) {

        } else {
            this.title = title
            this.description = description
            this.location = location
            this.start_time = start_time
            this.end_time = end_time
            this.organizer = organizer
            this.participants = participants
        }
        
    }

    event(googleEvent) {
        var attendeeIndex = -1
        var participant = ''
        
        if (googleEvent.attendees) {
            attendeeIndex = googleEvent.attendees.findIndex(item => item.responseStatus == 'needsAction')
            if (attendeeIndex == -1) {
                participant = ''
            } else {
                participant = googleEvent.attendees[attendeeIndex].email
            }
        }
        

        var dbEvent = {
            'id': googleEvent.id,
            'title': googleEvent.summary,
            'description': googleEvent.description,
            'location': googleEvent.location,
            'start_time': googleEvent.start.dateTime || googleEvent.start.date,
            'end_time': googleEvent.end.dateTime || googleEvent.end.date,
            'organizer': googleEvent.organizer.email,
            'participants': participant
        }

        return dbEvent
    }

    get googleEvent() {
        var event = {
            'summary': this.title,
            'location': this.location,
            'description': this.description,
            'organizer': {
                'email': this.organizer
            },
            'start': {
                'dateTime': this.start_time,
                'timeZone': 'Europe/Paris'
            },
            'end': {
                'dateTime': this.end_time,
                'timeZone': 'Europe/Paris'
            },
            'attendees': this.participants.map(participant => ({'email': participant})),
            'reminders': {
                'useDefault': false,
                'overrides': [],
            },
        };

        return event;
    }
}

module.exports = Event