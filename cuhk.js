function composeical() {
    var timezone = 'Asia/Hong_Kong';
    console.debug('Composing iCalContent');
    var iCalContent =
        'BEGIN:VEVENT\n' +
        'DTSTART;TZID=' + timezone + ':' + getDateTimeString(data['startDate'], data['startTime']) + '\n' +
        //'DTSTART;TZID=' + timezone + ':' + startDateString + 'T' + getTimeString(startTime) + '\n' +
        'DTEND;TZID=' + timezone + ':' + getDateTimeString(data['startDate'], data['endTime']) + '\n' +
        //'DTEND;TZID=' + timezone + ':' + startDateString + 'T' + getTimeString(endTime) + '\n' +
        'LOCATION:' + data['room'] + '\n' +
        'RRULE:FREQ=WEEKLY;UNTIL=' + getDateTimeString(data['endDate'], data['endTime']) + 'Z;BYDAY=' + data['daysOfWeek'] + '\n' +
        //'RRULE:FREQ=WEEKLY;UNTIL=' + endDateString + 'T' + getTimeString(endTime) + 'Z;BYDAY=' + daysOfWeek + '\n' +
        'EXDATE;TZID=' + timezone + ':' + getDateTimeString(data['startDate'], data['startTime']) + '\n' +
        //'EXDATE;TZID=' + timezone + ':' + startDateString + 'T' + getTimeString(startTime) + '\n' +
        'SUMMARY:' + data['courseCode'] + '(' + data['component'] + ')\n' +
        'DESCRIPTION:' +
        'Course Name: ' + data['courseName'] + '\\n' +
        'Section: ' + data['section'] + '\\n' +
        'Instructor: ' + data['instructor'] + '\\n' +
        'Component: ' + data['component'] + '\\n' +
        'Class Number: ' + data['classNumber'] + '\\n' +
        'Days/Times: ' + data['daysTimes'] + '\\n' +
        'Start/End Date: ' + data['startEndDate'] + '\\n' +
        'Location: ' + data['room'] + '\\n\\n\\n---\\n' +
        'Note: ' + 'Proudly brought to you by Alan Chen. If you find any mistake, please report it immediately to admin@zenan.ch or on Github as such mistake will annoy other students.' + '\\n\n' +
        'END:VEVENT\n';
    //console.debug(iCalContent);
    // Remove double spaces from content.
    iCalContent = iCalContent.replace(/\s{2,}/g, ' ');
    return iCalContent;
}

function datebuilder(dateString) {
    var dateArray = dateString.split('/');
    return new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
}

var selectors = {
    "componentRows": 'table[id^="CLASS_MTG_VW"]',
    "classNumber": 'td:nth-child(1)>span',
    "daysTimes": 'td:nth-child(4)>span',
    "section": 'a[id*="MTG_SECTION"]',
    "component": 'td:nth-child(3)>span',
    "room": 'td:nth-child(5)>span',
    "instructor": 'td:nth-child(6)>span',
    "startEndDate": 'td:nth-child(7)>span'
}
