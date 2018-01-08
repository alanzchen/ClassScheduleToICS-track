browser.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
        /* Enable the page-action for the requesting tab */
        browser.pageAction.show(sender.tab.id);
        browser.pageAction.onClicked.addListener(function(){
            browser.downloads.download({
              url: URL.createObjectURL(msg.blob),
              filename: "Course_Schedule.ics"
            });
        });
    }
});
