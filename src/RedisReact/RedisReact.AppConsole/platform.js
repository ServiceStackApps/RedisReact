/* console */
document.documentElement.className += ' console';

window.nativeHost = {
    quit: function() {
        $.get('/nativehost/quit');
        setTimeout(function() {
            window.close();
        });
    },
    platform: 'console'
};
