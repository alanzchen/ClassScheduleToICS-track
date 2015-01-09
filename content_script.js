/**
  * Class Schedule to ICS File Exporter
  * (c) 2015 Keanu Lee
  * With contributions from: Baraa Hamodi
  *
  * Get ICS files for university class schedules in Oracle PeopleSoft systems (including UW Quest)
**/

$(function() {
  // Timezone for tool.
  var time_zone = 'America/Toronto';

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
    var time_string = time.substr(0, time.length - 2);
    var parts = time_string.split(':');
    if (parts[0].length != 2) {
      parts[0] = '0' + parts[0];
    }
    time_string = parts.join('') + '00';
    if (time.match(/PM/) && parts[0] != 12) {
      time_string = (parseInt(time_string, 10) + 120000).toString();
    }
    return time_string;
  }

  // Date object, '4:30PM' -> '19920517T163000'
  function getDateTimeString(date, time) {
    return getDateString(date) + 'T' + getTimeString(time);
  }

  // MTWThF -> MO,TU,WE,TH,FR
  function getDaysOfWeek(s) {
    var days = []
    if (s.match(/S[^a]/)) days.push('SU');
    if (s.match(/M/))     days.push('MO');
    if (s.match(/T[^h]/)) days.push('TU');
    if (s.match(/W/))     days.push('WE');
    if (s.match(/Th/))    days.push('TH');
    if (s.match(/F/))     days.push('FR');
    if (s.match(/S[^u]/)) days.push('SA');

    return days.join(',')
  }

  // VEVENT -> BEGIN:VCALENDAR...VEVENT...END:VCALENDAR
  function ics_content_wrap(ics_content) {
    return 'BEGIN:VCALENDAR\n' +
      'VERSION:2.0\n' +
      'PRODID:-//Keanu Lee/Class Schedule to ICS//EN\n' +
      ics_content +
      'END:VCALENDAR\n';
  }

  ics_content_array = []

  $('.PSGROUPBOXWBO').each(function() {
    var event_title = $(this).find('.PAGROUPDIVIDER').text().split('-');
    var course_code = event_title[0];
    var course_name = event_title[1];
    var component_trs = $(this).find('.PSLEVEL3GRIDNBO').find('tr');

    component_trs.each(function() {
      var class_number = $(this).find('span[id*="DERIVED_CLS_DTL_CLASS_NBR"]').text();

      if (class_number) {
        var days_times      = $(this).find('span[id*="MTG_SCHED"]').text();
        var start_end_times = days_times.match(/\d\d?:\d\d[AP]M/g);

        if (start_end_times) {
          var days_of_week  = getDaysOfWeek(days_times.match(/[A-Za-z]* /)[0]);
          var start_time    = start_end_times[0];
          var end_time      = start_end_times[1];

          var section         = $(this).find('a[id*="MTG_SECTION"]').text();
          var component       = $(this).find('span[id*="MTG_COMP"]').text();
          var room            = $(this).find('span[id*="MTG_LOC"]').text();
          var instructor      = $(this).find('span[id*="DERIVED_CLS_DTL_SSR_INSTR_LONG"]').text();
          var start_end_date  = $(this).find('span[id*="MTG_DATES"]').text();

          // Start the event one day before the actual start date, then exclude it in an exception
          // date rule. This ensures an event does not occur on start_date if start_date is not on
          // part of days_of_week.
          var start_date = new Date(start_end_date.substring(0, 10));
          start_date.setDate(start_date.getDate() - 1);

          // End the event one day after the actual end date. Technically, the RRULE UNTIL field
          // should be the start time of the last occurence of an event. However, since the field
          // does not accept a timezone (only UTC time) and Toronto is always behind UTC, we can
          // just set the end date one day after and be guarenteed that no other occurence of
          // this event.
          var end_date = new Date(start_end_date.substring(13, 23));
          end_date.setDate(end_date.getDate() + 1);

          var ics_content = 'BEGIN:VEVENT\n' +
                            'DTSTART;TZID=' + time_zone + ':' + getDateTimeString(start_date, start_time) + '\n' +
                            'DTEND;TZID=' + time_zone + ':' + getDateTimeString(start_date, end_time) + '\n' +
                            'LOCATION:' + room + '\n' +
                            'RRULE:FREQ=WEEKLY;UNTIL=' + getDateTimeString(end_date, end_time) + 'Z;BYDAY=' + days_of_week + '\n' +
                            'EXDATE;TZID=' + time_zone + ':' + getDateTimeString(start_date, start_time) + '\n' +
                            'SUMMARY:'  + course_code + '(' + component + ')\n' +
                            'DESCRIPTION:' +
                              'Course Name: '    + course_name + '\\n' +
                              'Section: '        + section + '\\n' +
                              'Instructor: '     + instructor + '\\n' +
                              'Component: '      + component + '\\n' +
                              'Class Number: '   + class_number + '\\n' +
                              'Days/Times: '     + days_times + '\\n' +
                              'Start/End Date: ' + start_end_date + '\\n' +
                              'Location: '       + room + '\\n\n' +
                            'END:VEVENT\n';

          // Remove double spaces from content.
          ics_content = ics_content.replace(/\s{2,}/g, ' ');
          ics_content_array.push(ics_content);

          $(this).find('span[id*="MTG_DATES"]').append(
            '<a href="#" onclick="window.open(\'data:text/calendar;charset=utf8,' +
            encodeURIComponent(ics_content_wrap(ics_content)) +
            '\');"><div>Download Class</div></a>'
          );
        } // end if (start_end_times)
      } // end if (class_number)
    }); // end component_trs.each
  }); // end $(".PSGROUPBOXWBO").each

  if (ics_content_array.length > 0) {
    $('.PATRANSACTIONTITLE').append(
      ' (<a href="#" onclick="window.open(\'data:text/calendar;charset=utf8,' +
      encodeURIComponent(ics_content_wrap(ics_content_array.join(''))) +
      '\');">Download Schedule</a>)'
    );
  }
})();
