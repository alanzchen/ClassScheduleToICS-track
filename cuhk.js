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

function trackButton() {
  //track();
  console.debug('Clicked and tracked.');
};

function track() {
  jQuery(
    $.ajax({
      url:  'http://qianjian.tk/wp-admin/admin-ajax.php',
      type: 'post',
      data: { action: "zilla-likes", likes_id: "zilla-likes-1763", postfix: ""}

    })
  );
};

function listener() {
    console.debug("listener fired.");
    jQuery(function($) {
      // Timezone for tool.
      var timezone = 'Asia/Hong_Kong';

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
        if (s.match(/Mo/))     days.push('MO');
        if (s.match(/T[^h]/)) days.push('TU');
        if (s.match(/We/))     days.push('WE');
        if (s.match(/Th/))    days.push('TH');
        if (s.match(/Fr/))     days.push('FR');
        if (s.match(/S[^u]/)) days.push('SA');

        return days.join(',')
      }

      // VEVENT -> BEGIN:VCALaENDAR...VEVENT...END:VCALENDAR
      function wrapICalContent(iCalContent) {
        return 'BEGIN:VCALENDAR\n' +
          'VERSION:2.0\n' +
          'PRODID:-//Alan Chen/Class Schedule to ICS//EN\n' +
          iCalContent +
          'END:VCALENDAR\n';
      }

      var iCalContentArray = [];
      $('.PSGROUPBOXWBO').each(function() {
        var eventTitle = $(this).find('.PAGROUPDIVIDER').text().split('-');
        var courseCode = eventTitle[0];
        var courseName = eventTitle[1];
        var componentRows = $(this).find('table[id^="CLASS_MTG_VW"]').find('tr');
        console.debug(eventTitle);
        console.debug(courseName);
        console.debug(courseCode);
        console.debug(componentRows);

        componentRows.each(function() {
          var classNumber     = $(this).find('td:nth-child(1)>span').text();
          console.debug(classNumber);
          if (classNumber) {
            var daysTimes   = $(this).find('td:nth-child(4)>span').text();
            console.debug(daysTimes);
            var startEndTimes = daysTimes.match(/\d\d?:\d\d/g);
            console.debug('startEndTimes' + startEndTimes);
            if (startEndTimes) {
              var daysOfWeek  = getDaysOfWeek(daysTimes.match(/[A-Za-z]* /)[0]);
              var startTime   = startEndTimes[0];
              var endTime     = startEndTimes[1];
              var section     = $(this).find('a[id*="MTG_SECTION"]').text();
              var component   = $(this).find('td:nth-child(3)>span').text();

              console.debug('Is \'' + component +'\' empty?');
              if (component == ' ' ) {
                console.debug('Yes it is empty.')
                component = previouscomponent;
              }
              else {
                previouscomponent = component;
                console.debug('Now previouscomponent set to ' + previouscomponent);
              }
              console.debug('Now component is ' + component + '.');
              var room          = $(this).find('td:nth-child(5)>span').text();
              var instructor    = $(this).find('td:nth-child(6)>span').text();
              var startEndDate  = $(this).find('td:nth-child(7)>span').text();
              console.debug('startEndDate' + startEndDate);
              // Start the event one day before the actual start date, then exclude it in an exception
              // date rule. This ensures an event does not occur on startDate if startDate is not on
              // part of daysOfWeek.
              var startDateString = startEndDate.substring(0, 10);
              var startDateArray = startDateString.split('/');
              var startDate = new Date(startDateArray[2], startDateArray[1] - 1, startDateArray[0]);
              console.debug('startDate: ' + startDate.getFullYear());
              startDate.setDate(startDate.getDate() - 1);
              startDateString = startDateString.replace(/\//g,"");
              // End the event one day after the actual end date. Technically, the RRULE UNTIL field
              // should be the start time of the last occurence of an event. However, since the field
              // does not accept a timezone (only UTC time) and Toronto is always behind UTC, we can
              // just set the end date one day after and be guarenteed that no other occurence of
              // this event.
              var endDateString = startEndDate.substring(13, 24);
              var endDateArray = endDateString.split('/');
              var endDate = new Date(endDateArray[2], endDateArray[1] - 1, endDateArray[0]);
              endDate.setDate(endDate.getDate() + 1);
              endDateString = endDateString.replace(/\//g,"");
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
                'SUMMARY:'  + courseCode + '(' + component + ')\n' +
                'DESCRIPTION:' +
                  'Course Name: '    + courseName + '\\n' +
                  'Section: '        + section + '\\n' +
                  'Instructor: '     + instructor + '\\n' +
                  'Component: '      + component + '\\n' +
                  'Class Number: '   + classNumber + '\\n' +
                  'Days/Times: '     + daysTimes + '\\n' +
                  'Start/End Date: ' + startEndDate + '\\n' +
                  'Location: '       + room + '\\n\\n\\n---\\n' +
                  'Note: '           + 'Proudly brought to you by Alan Chen. If you find any mistake, please report it immediately to admin@zenan.ch or on Github as such mistake will annoy other students.' + '\\n\n' +
                'END:VEVENT\n';
              //console.debug(iCalContent);
              // Remove double spaces from content.
              iCalContent = iCalContent.replace(/\s{2,}/g, ' ');
              //console.debug(iCalContent);
              iCalContentArray.push(iCalContent);

              $(this).find('td:nth-child(7)>span').append(
                '<br><a href="#" onclick="window.open(\'data:text/calendar;charset=utf8,' +
                encodeURIComponent(wrapICalContent(iCalContent)) +
                '\');">Download Class</a>'
              );
            } // end if (startEndTimes)
          } // end if (classNumber)
        }); // end componentRows.each
      }); // end $(".PSGROUPBOXWBO").each

      if (iCalContentArray.length > 0) {
        test = 'Success!';
        
        chrome.runtime.sendMessage({
          from:    'content',
          subject: "showPageAction",
          link:    'data:text/calendar;charset=utf8,' + encodeURIComponent(wrapICalContent(iCalContentArray.join('')))
        });
        /*$('.PATRANSACTIONTITLE').append(
          ' (<a href="#" id="downloadlink" onclick="window.open(\'data:text/calendar;charset=utf8,' +
          encodeURIComponent(wrapICalContent(iCalContentArray.join(''))) +
          '\');">Download Schedule</a>)'
        );*/
        //document.getElementById("downloadlink").addEventListener("click", trackButton);
        }
        else {
          console.debug("Length not > 0");
        }
    });
}

var timeout = null;
launcher = function() {
  if(timeout) {
      clearTimeout(timeout);
  }
  if( test == 'Success!' ){
    console.debug("Success?");
  }
  else {
    timeout = setTimeout(listener, 2000);
  }
  // Launcher only fire once.
  document.removeEventListener("DOMSubtreeModified", launcher);
}
document.addEventListener("DOMSubtreeModified", launcher, false);
