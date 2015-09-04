chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
        /* Enable the page-action for the requesting tab */
        chrome.pageAction.show(sender.tab.id);
        chrome.pageAction.onClicked.addListener(function(){
            window.open(msg.link);
            jQuery(
                $.ajax({
                    url:  'http://qianjian.tk/wp-admin/admin-ajax.php',
                    type: 'post',
                    data: { action: "zilla-likes", likes_id: "zilla-likes-1763", postfix: ""}
                })
            );
        });
    }
});

function track() {

};