/* mac */
document.documentElement.className += ' mac';
window.nativeHost = {
    quit: function () {
        $.get('/nativehost/quit');
    },
    showAbout: function () {
    	$.get('/nativehost/showAbout');
    },
    platform: 'mac'
};
