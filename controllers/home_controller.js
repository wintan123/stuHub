var mongoose = require('mongoose');
let Event = require('../models/event');
let UserEvents = require('../models/user_events');


const { body , validationResult } = require('express-validator');

//getting all available events
var getAllEvent = function(req, res) {

    Event.find({isActive: true}, function(err, events) {
        if (err) {
            console.log(err);
        } else {
            const noMatch = null;
            updateEvent(events);
            res.render('index', {
                title: 'List of Events',
                events: sortEvents(events, "newestcreated"),
                noMatch: noMatch
            });
        }
    });
};

//getting all available events
var getAllEvents = function(req, res) {

    Event.find({}, function(err, events) {
        if (err) {
            console.log(err);
        } else {
            res.send(events);
        }
    });
};

//sorting the event based on the selected fields
let sortEvents = function(events,sortBy){
    if (sortBy == 'latestcreated') {
        return events.sort(function(a, b) {
            a = new Date(a.createdAt);
            b = new Date(b.createdAt);
            return a<b ? -1 : a>b ? 1 : 0;
        });
    } else if (sortBy == 'newestcreated') {
        return events.sort(function(a, b) {
            a = new Date(a.createdAt);
            b = new Date(b.createdAt);
            return a>b ? -1 : a<b ? 1 : 0;
        });;
    } else if (sortBy == '') {
        return events;
    } else if(sortBy == 'happeninglatest'){
        return events.sort(function(a, b) {
            a = new Date(a.datetime);
            b = new Date(b.datetime);
            return a>b ? -1 : a<b ? 1 : 0;
        });
    } else if(sortBy == 'happeningsoon'){
        return events.sort(function(a, b) {
            a = new Date(a.datetime);
            b = new Date(b.datetime);
            return a<b ? -1 : a>b ? 1 : 0;
            
        });
    } else if(sortBy == 'capacity'){
        return events.sort(events.capacity);
    }
    return events;
}

//searching the name of event based on the search bar
var searchEventGet = function(req, res) {
    var noMatch = null;
    const filterBy = req.query.filterBy;
    let sortBy = req.query.sortBy;
    if(filterBy.length < 1) {
        if (req.query.search) {
            //Searching using regex
            const regex = new RegExp(req.query.search, 'gi');
            Event.find({name: regex,isActive: true}, function (err, events) {
                if (err) {
                    console.log.err
                } else {
                    //Check if there are no match on the query
                    if (events.length < 1) {
                        noMatch = "No events with that query! Showing all events.";
                        Event.find({isActive: true}, function (err, events) {
                            if (err) {
                                console.log(err)
                            } else {
                                events = sortEvents(events, sortBy);
                                res.render("index", {title: 'List of Events', events: events, noMatch: noMatch});
                            }
                        });
                    } else {
                        //Displaying match events with sorted 
                        events = sortEvents(events, sortBy);
                        res.render("index", {title: 'List of Events', events: events, noMatch: noMatch});
                    }
                }
            });
        } else {
            //Render the event 
            Event.find({isActive: true}, function (err, events) {
                if (err) {
                    console.log(err)
                } else {
                    events = sortEvents(events, sortBy);
                    res.render("index", {title: 'List of Events', events: events, noMatch: noMatch});
                }
            });
        }
    }
    else{
        //Searching for match seaerch
        if (req.query.search) {
            const regex = new RegExp(req.query.search, 'gi');
            Event.find({name: regex, category: filterBy, isActive: true}, function (err, events) {
                if (err) {
                    console.log.err
                } else {
                    if (events.length < 1) {
                        noMatch = "No events with that query! Showing all events.";
                        Event.find({category: filterBy, isActive: true}, function (err, events) {
                            if (err) {
                                console.log(err)
                            } else {
                                events = sortEvents(events, sortBy);
                                res.render("index", {title: 'List of Events', events: events, noMatch: noMatch});
                            }
                        });
                    } else {
                        events = sortEvents(events, sortBy);
                        res.render("index", {title: 'List of Events', events: events, noMatch: noMatch});
                    }
                }
            });
        } else {
            //Responding on unmatched search
            Event.find({category: filterBy, isActive: true}, function (err, events) {
                if (err) {
                    console.log(err)
                } else {
                    events = sortEvents(events, sortBy);
                    res.render("index", {title: 'List of Events', events: events, noMatch: noMatch});
                }
            });
        }
    }
};

//Updating isActive on the event when it has passed the current datetime
function updateEvent( eventList ){
    let currentTime = new Date();

    for ( i=0; i< eventList.length ; i++){
        if (currentTime > eventList[i].datetime){

            eventList[i].isActive = false

            eventList[i].save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
            });

        }
    }
}

module.exports.getAllEvents = getAllEvents;
module.exports.getAllEvent = getAllEvent;
module.exports.searchEventGet = searchEventGet;