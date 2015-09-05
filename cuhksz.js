function composeical(startDate, startTime, startDateString, endDate, endTime, endDateString,
  courseCode, courseName, component, section, instructor, classNumber, daysTimes, startEndDate, room, daysOfWeek) {
    var timezone = 'Asia/Beijing';
    console.debug('Composing iCalContent');
    var iCalContent =
        'BEGIN:VEVENT\n' +
        //'DTSTART;TZID=' + timezone + ':' + getDateTimeString(startDate, startTime) + '\n' +
        'DTSTART;TZID=' + timezone + ':' + startDateString + 'T' + getTimeString(startTime) + '\n' +
        //'DTEND;TZID=' + timezone + ':' + getDateTimeString(startDate, endTime) + '\n' +
        'DTEND;TZID=' + timezone + ':' + startDateString + 'T' + getTimeString(endTime) + '\n' +
        'LOCATION:' + room + '\n' +
        //'RRULE:FREQ=WEEKLY;UNTIL=' + getDateTimeString(endDate, endTime) + 'Z;BYDAY=' + daysOfWeek + '\n' +
        'RRULE:FREQ=WEEKLY;UNTIL=' + endDateString + 'T' + getTimeString(endTime) + 'Z;BYDAY=' + daysOfWeek + '\n' +
        //'EXDATE;TZID=' + timezone + ':' + getDateTimeString(startDate, startTime) + '\n' +
        'EXDATE;TZID=' + timezone + ':' + startDateString + 'T' + getTimeString(startTime) + '\n' +
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
        'Note: ' + 'Proudly brought to you by Alan(CUHKSZ) and Max Sum(CUHK). If you find any mistake, please report it immediately to admin@zenan.ch or on Github.' + '\\n\n' +
        'END:VEVENT\n';
    //console.debug(iCalContent);
    // Remove double spaces from content.
    iCalContent = iCalContent.replace(/\s{2,}/g, ' ');
    return iCalContent;
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