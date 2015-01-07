/**
  * Class Schedule to ICS File Exporter
  * (c) 2015 Keanu Lee
  * With contributions from: Baraa Hamodi
  *
  * Get ICS files for university class schedules in Oracle PeopleSoft systems (including UW Quest)
  *
  * TODO list:
  * - Properly handle date numbers (e.g. 20130901 - 1 != 20130900, 20130131 + 1 != 20130132)
**/

$(function() {
  // Ontario is UTC-4
  // TODO: Create a getUTCOffset function that handles day light savings.
  utc_offset  = -4;


  // 05/17/1992 -> 19920517
  function getDateString(date) {
    return date.substr(6,4) +
      date.substr(0,2) +
      date.substr(3,2);
  }

  // 4:30PM -> 203000
  function getTimeString(time) {
    time_string = (parseInt(time.replace(/[:APM]/g, "")) +
                  (time.match(/P/) ? 1200 : 0) -
                  (time.match(/12:\d\dPM/) ? 1200 : 0) -
                  (utc_offset * 100)) * 100;

    if (time_string < 100000) time_string = "0" + time_string;

    return time_string;
  }

  // 19920517, 203000 -> 19920517T203000Z
  function formatDateTime(date, time) {
    time = parseInt(time);
    if (time >= 240000) {
      date = parseInt(date) + 1;
      time -= 240000;

      if (time < 100000) time = "0" + time;
    }

    return date + 'T' + time + 'Z'
  }

  // MTWThF -> MO,TU,WE,TH,FR
  function getDaysOfWeek(s) {
    days = []
    if (s.match(/S[^a]/)) days.push("SU");
    if (s.match(/M/))     days.push("MO");
    if (s.match(/T[^h]/)) days.push("TU");
    if (s.match(/W/))     days.push("WE");
    if (s.match(/Th/))    days.push("TH");
    if (s.match(/F/))     days.push("FR");
    if (s.match(/S[^u]/)) days.push("SA");

    return days.join(',')
  }

  // VEVENT -> BEGIN:VCALENDAR...VEVENT...END:VCALENDAR
  function ics_content_wrap(ics_content) {
    return "BEGIN:VCALENDAR\n" +
      "VERSION:2.0\n" +
      "PRODID:-//Keanu Lee/Class Schedule to ICS//EN\n" +
      ics_content +
      "END:VCALENDAR\n";
  }

  ics_content_array = []

  $(".PSGROUPBOXWBO").each(function() {
    event_title = $(this).find(".PAGROUPDIVIDER").text().split('-');
    course_code = event_title[0];
    course_name = event_title[1];
    component_trs = $(this).find(".PSLEVEL3GRIDNBO").find("tr");

    component_trs.each(function() {
      class_number = $(this).find('span[id*="DERIVED_CLS_DTL_CLASS_NBR"]').text();

      if (class_number) {
        section         = $(this).find('a[id*="MTG_SECTION"]').text();
        component       = $(this).find('span[id*="MTG_COMP"]').text();
        days_times      = $(this).find('span[id*="MTG_SCHED"]').text();
        room            = $(this).find('span[id*="MTG_LOC"]').text();
        instructor      = $(this).find('span[id*="DERIVED_CLS_DTL_SSR_INSTR_LONG"]').text();
        start_end_date  = $(this).find('span[id*="MTG_DATES"]').text();

        start_date      = getDateString(start_end_date);
        end_date        = getDateString(start_end_date.substr(13));

        // Start the event on the day before start_date, then exclude it in an exception date rule
        // This ensures an event does not occur on start_date if start_date is not on part of days_of_week
        date_before     = start_date - 1;

        start_end_times = days_times.match(/\d\d?:\d\d[AP]M/g);

        if (start_end_times) {
          start_time    = getTimeString(start_end_times[0]);
          end_time      = getTimeString(start_end_times[1]);

          days_of_week  = getDaysOfWeek(days_times.match(/[A-Za-z]* /)[0])

          ics_content = "BEGIN:VEVENT\n" +
                        "DTSTART:" + formatDateTime(date_before, start_time) + "\n" +
                        "DTEND:" + formatDateTime(date_before, end_time) + "\n" +
                        "LOCATION:" + room + "\n" +
                        "RRULE:FREQ=WEEKLY;UNTIL=" + formatDateTime(end_date, end_time) + ";BYDAY=" + days_of_week + "\n" +
                        "EXDATE:"   + formatDateTime(date_before, start_time) + "\n" +
                        "SUMMARY:"  + course_code + component + ' in ' + room + "\n" +
                        "DESCRIPTION:" +
                          'Course Name: '    + course_name + '\\n' +
                          'Section: '        + section + '\\n' +
                          'Instructor: '     + instructor + '\\n' +
                          'Component: '      + component + '\\n' +
                          'Class Number: '   + class_number + '\\n' +
                          'Days/Times: '     + days_times + '\\n' +
                          'Start/End Date: ' + start_end_date + '\\n' +
                          'Location: '       + room + '\\n\n' +
                        "END:VEVENT\n";

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
