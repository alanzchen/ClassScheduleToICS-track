// '4:30PM' -> '163000'
function getTimeString(time) {
    var timeString = time;
    var parts = timeString.split(':');
    if (parts[0].length != 2) {
        parts[0] = '0' + parts[0];
    }
    timeString = parts.join('') + '00';
    if (time.match(/PM/) && parts[0] != 12) {
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
