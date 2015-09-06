/**
 * Class Schedule to ICS File Exporter
 * (c) 2015 Alan
 * With contributions from: Baraa Hamodi, Keanu Lee
 *
 * Ported to CUHK by: Max Sum <maxsumprc@gmail.com>
 *
 * Get ICS files for university class schedules in Oracle PeopleSoft systems (including CUHKSZ)
 **/

var test;
var previouscomponent;
var previousClassNumber;
var previousSection;

// Date object -> '19920517'
function getDateString(date) {
    var m = date.getMonth() + 1;
    if (m < 10) m = '0' + m;

    var d = date.getDate();
    if (d < 10) d = '0' + d;

    return '' + date.getFullYear() + m + d;
}

// '4:30PM' -> '163000'
function getTimeString(time) {
    var timeString = time;
    var parts = timeString.split(':');
    if (parts[0].length != 2) {
        parts[0] = '0' + parts[0];
    }
    parts[1] = parts[1].substring(0, 2);
    timeString = parts.join('') + '00';
    if (time.substr(-2) == 'PM' && parts[0] != 12) {
        timeString = (parseInt(timeString, 10) + 120000).toString();
    }
    return timeString;
}

// Date object, '4:30PM' -> '19920517T163000'
function getDateTimeString(date, time) {
    return getDateString(date) + 'T' + getTimeString(time);
}

// MTWThF -> MO,TU,WE,TH,FR
function getDaysOfWeek(s) {
    var days = []
    if (s.match(/S[^a]/)) days.push('SU');
    if (s.match(/M/)) days.push('MO');
    if (s.match(/T[^h]/)) days.push('TU');
    if (s.match(/W/)) days.push('WE');
    if (s.match(/Th/)) days.push('TH');
    if (s.match(/F/)) days.push('FR');
    if (s.match(/S[^u]/)) days.push('SA');

    return days.join(',')
}

// VEVENT -> BEGIN:VCALENDAR...VEVENT...END:VCALENDAR
function wrapICalContent(iCalContent) {
    return 'BEGIN:VCALENDAR\n' +
        'VERSION:2.0\n' +
        'PRODID:-//Alan Chen/Class Schedule to ICS//EN\n' +
        iCalContent +
        'END:VCALENDAR\n';
}

function fillempty(data) {
    console.debug('Is \'' + data['component'] + '\' empty?');
    if (data['component'] == ' ') {
        console.debug('Yes it is empty.')
        data['component'] = previouscomponent;
    } else {
        previouscomponent = data['component'];
        console.debug('Now previouscomponent set to ' + previouscomponent);
    }
    console.debug('Now component is ' + data['component'] + '.');
    console.debug(data['classNumber'] + 'has a length of ' + data['classNumber'].length);
    if (data['classNumber'].length == 1) {
        console.debug('Yes classNumber is empty.')
        data['classNumber'] = previousClassNumber;
    } else {
        previousClassNumber = data['classNumber'];
        console.debug('Now previousClassNumber set to ' + previousClassNumber);
    }
    console.debug(data['section'] + 'has a length of ' + data['section'].length);
    if (data['section'].length == 0) {
        console.debug('Yes section' + data['section'] + ' is empty.')
        data['section'] = previousSection;
    } else {
        previousSection = data['section'];
        console.debug('Now previousSection set to ' + previousSection);
    }
}


function listener() {
    console.debug("listener fired.");
    jQuery(function($) {
        var iCalContentArray = [];
        var data = [];

        $('.PSGROUPBOXWBO').each(function() {
            var eventTitle = $(this).find('.PAGROUPDIVIDER').text().split('-');
            data['courseCode'] = eventTitle[0];
            data['courseName'] = eventTitle[1];
            componentRows = $(this).find(selectors['componentRows']).find('tr');
            console.debug(eventTitle);
            console.debug(data['courseName']);
            console.debug(data['courseCode']);
            console.debug(componentRows);

            componentRows.each(function() {

                // Collect Data
                data['classNumber'] = $(this).find(selectors['classNumber']).text();
                console.debug(!data['classNumber']);
                if (data['classNumber']) {
                    var daysTimes = $(this).find(selectors['daysTimes']).text();
                    console.debug(daysTimes);
                    data['startEndTimes'] = daysTimes.match(/\d\d?:\d\d([AP]M)?/g);
                    console.debug('startEndTimes' + data['startEndTimes']);
                    if (data['startEndTimes']) {
                        data['daysOfWeek'] = getDaysOfWeek(daysTimes.match(/[A-Za-z]* /)[0]);
                        data['startTime'] = data['startEndTimes'][0];
                        data['endTime'] = data['startEndTimes'][1];
                        data['section'] = $(this).find(selectors['section']).text();
                        data['component'] = $(this).find(selectors['component']).text();
                        data['room'] = $(this).find(selectors['room']).text();
                        data['instructor'] = $(this).find(selectors['instructor']).text();
                        data['startEndDate'] = $(this).find(selectors['startEndDate']).text();
                        console.debug('startEndDate' + data['startEndDate']);
                        // Start the event one day before the actual start date, then exclude it in an exception
                        // date rule. This ensures an event does not occur on startDate if startDate is not on
                        // part of daysOfWeek.
                        data['startDateString'] = data['startEndDate'].substring(0, 10);
                        data['startDate'] = datebuilder(data['startDateString']);
                        data['startDate'].setDate(data['startDate'].getDate() - 1);
                        data['startDateString'] = data['startDateString'].replace(/\//g, "");
                        // End the event one day after the actual end date. Technically, the RRULE UNTIL field
                        // should be the start time of the last occurence of an event. However, since the field
                        // does not accept a timezone (only UTC time) and Toronto is always behind UTC, we can
                        // just set the end date one day after and be guarenteed that no other occurence of
                        // this event.
                        data['endDate'] = new datebuilder(data['startEndDate'].substring(14, 24));
                        data['endDate'].setDate(data['endDate'].getDate() + 1);
                        data['endDateString'] = data['startEndDate'].substring(13, 24);
                        data['endDateString'] = data['endDateString'].replace(/\//g, "");


                        // Fix empty things
                        fillempty(data);

                        var iCalContent = composeical(data);
                        iCalContentArray.push(iCalContent);
                        $(this).find(selectors['startEndDate']).append(
                            '<br><a href="#" class="downloadlink" onclick="window.open(\'data:text/calendar;charset=utf8,' +
                            encodeURIComponent(wrapICalContent(iCalContent)) +
                            '\');">Download Class</a>'
                        );
                    } // end if (startEndTimes)
                } // end if (classNumber)
                console.debug(data);
            }); // end componentRows.each
        }); // end $(".PSGROUPBOXWBO").each

        if (iCalContentArray.length > 0) {
            test = 'Success!';

            chrome.runtime.sendMessage({
                from: 'content',
                subject: "showPageAction",
                link: 'data:text/calendar;charset=utf8,' + encodeURIComponent(wrapICalContent(iCalContentArray.join('')))
            });
        } else {
            console.debug("Length not > 0");
        }
    });
}



var timeout = null;
document.addEventListener("DOMSubtreeModified", function() {
    if (timeout) {
        clearTimeout(timeout);
    }
    if (test == 'Success!') {
        console.debug("Success?");
    } else if ($(".downloadlink").length == 0) {
        timeout = setTimeout(listener, 2000);
    }
}, false);
