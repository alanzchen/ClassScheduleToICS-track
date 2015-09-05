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

function listener() {
    console.debug("listener fired.");
    jQuery(function($) {
      // Timezone for tool.
      var timezone = 'Asia/Hong_Kong';

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
          if (classNumber) {
            var daysTimes   = $(this).find('td:nth-child(4)>span').text();
            console.debug(daysTimes);
            var startEndTimes = daysTimes.match(/\d\d?:\d\d[AP]M/g);
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
              console.debug(classNumber + 'has a length of ' + classNumber.length);
              if (classNumber.length == 1) {
                console.debug('Yes classNumber is empty.')
                classNumber = previousClassNumber;
              }
              else {
                previousClassNumber = classNumber;
                console.debug('Now previousClassNumber set to ' + previousClassNumber);
              }
              console.debug(section + 'has a length of ' + section.length);
              if (section.length == 0 ) {
                console.debug('Yes section' + section + ' is empty.')
                section = previousSection;
              }
              else {
                previousSection = section;
                console.debug('Now previousSection set to ' + previousSection);
              }
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
                '<br><a href="#" class="downloadlink" onclick="window.open(\'data:text/calendar;charset=utf8,' +
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
        }
        else {
          console.debug("Length not > 0");
        }
    });
}

var timeout = null;
document.addEventListener("DOMSubtreeModified", function() {
    if(timeout) {
        clearTimeout(timeout);
    }
    if( test == 'Success!' ){
      console.debug("Success?");
    }
    else if($(".downloadlink").length == 0){
      timeout = setTimeout(listener, 2000);
    }
}, false);