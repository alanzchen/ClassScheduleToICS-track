function composeical(data) {
    var timezone = 'Asia/Beijing';
    console.debug('Composing iCalContent');
    var iCalContent =
        'BEGIN:VEVENT\n' +
        //'DTSTART;TZID=' + timezone + ':' + getDateTimeString(startDate, startTime) + '\n' +
        'DTSTART;TZID=' + timezone + ':' + data['startDateString'] + 'T' + getTimeString(data['startTime']) + '\n' +
        //'DTEND;TZID=' + timezone + ':' + getDateTimeString(startDate, endTime) + '\n' +
        'DTEND;TZID=' + timezone + ':' + data['startDateString'] + 'T' + getTimeString(data['endTime']) + '\n' +
        'LOCATION:' + data['room'] + '\n' +
        //'RRULE:FREQ=WEEKLY;UNTIL=' + getDateTimeString(endDate, endTime) + 'Z;BYDAY=' + daysOfWeek + '\n' +
        'RRULE:FREQ=WEEKLY;UNTIL=' + data['endDateString'] + 'T' + getTimeString(data['endTime']) + 'Z;BYDAY=' + data['daysOfWeek'] + '\n' +
        //'EXDATE;TZID=' + timezone + ':' + getDateTimeString(startDate, startTime) + '\n' +
        'EXDATE;TZID=' + timezone + ':' + data['startDateString'] + 'T' + getTimeString(data['startTime']) + '\n' +
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
        'Note: ' + 'Proudly brought to you by Alan(CUHKSZ) and Max Sum(CUHK). If you find any mistake, please report it immediately to admin@zenan.ch or on Github.' + '\\n\n' +
        'END:VEVENT\n';
    //console.debug(iCalContent);
    // Remove double spaces from content.
    iCalContent = iCalContent.replace(/\s{2,}/g, ' ');
    return iCalContent;
}

function datebuilder(dateString) {
    return new date(dateString);
}

var selectors = {
  "componentRows" : '.PSLEVEL3GRIDNBO',
  "classNumber" : 'span[id*="DERIVED_CLS_DTL_CLASS_NBR"]',
  "daysTimes" : 'span[id*="MTG_SCHED"]',
  "section" : 'a[id*="MTG_SECTION"]',
  "component" : 'span[id*="MTG_COMP"]',
  "room" : 'span[id*="MTG_LOC"]',
  "instructor" : 'span[id*="DERIVED_CLS_DTL_SSR_INSTR_LONG"]',
  "startEndDate" : 'span[id*="MTG_DATES"]'
}