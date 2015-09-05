function composeical(timezone, startDate, startTime, startDateString, endDate, endTime, endDateString,
  courseCode, courseName, component, section, instructor, classNumber, daysTimes, startEndDate, room, daysOfWeek) {
    var timezone = 'Asia/Hong_Kong';
    console.debug('Composing iCalContent');
    var iCalContent =
        'BEGIN:VEVENT\n' +
        'DTSTART;TZID=' + timezone + ':' + getDateTimeString(startDate, startTime) + '\n' +
        //'DTSTART;TZID=' + timezone + ':' + startDateString + 'T' + getTimeString(startTime) + '\n' +
        'DTEND;TZID=' + timezone + ':' + getDateTimeString(startDate, endTime) + '\n' +
        //'DTEND;TZID=' + timezone + ':' + startDateString + 'T' + getTimeString(endTime) + '\n' +
        'LOCATION:' + room + '\n' +
        'RRULE:FREQ=WEEKLY;UNTIL=' + getDateTimeString(endDate, endTime) + 'Z;BYDAY=' + daysOfWeek + '\n' +
        //'RRULE:FREQ=WEEKLY;UNTIL=' + endDateString + 'T' + getTimeString(endTime) + 'Z;BYDAY=' + daysOfWeek + '\n' +
        'EXDATE;TZID=' + timezone + ':' + getDateTimeString(startDate, startTime) + '\n' +
        //'EXDATE;TZID=' + timezone + ':' + startDateString + 'T' + getTimeString(startTime) + '\n' +
        'SUMMARY:' + courseCode + '(' + component + ')\n' +
        'DESCRIPTION:' +
        'Course Name: ' + courseName + '\\n' +
        'Section: ' + section + '\\n' +
        'Instructor: ' + instructor + '\\n' +
        'Component: ' + component + '\\n' +
        'Class Number: ' + classNumber + '\\n' +
        'Days/Times: ' + daysTimes + '\\n' +
        'Start/End Date: ' + startEndDate + '\\n' +
        'Location: ' + room + '\\n\\n\\n---\\n' +
        'Note: ' + 'Proudly brought to you by Alan Chen. If you find any mistake, please report it immediately to admin@zenan.ch or on Github as such mistake will annoy other students.' + '\\n\n' +
        'END:VEVENT\n';
    //console.debug(iCalContent);
    // Remove double spaces from content.
    iCalContent = iCalContent.replace(/\s{2,}/g, ' ');
    return iCalContent;
}

var selectors = {
  "componentRows" : 'table[id^="CLASS_MTG_VW"]',
  "classNumber" : 'td:nth-child(1)>span',
  "daysTimes" : 'td:nth-child(4)>span',
  "section" : 'a[id*="MTG_SECTION"]',
  "component" : 'td:nth-child(3)>span',
  "room" : 'td:nth-child(5)>span',
  "instructor" : 'td:nth-child(6)>span',
  "startEndDate" : 'td:nth-child(7)>span'
}