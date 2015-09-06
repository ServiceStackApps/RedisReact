window.nativeHost = {
    quit: function () {
        $.get('/nativehost/quit');
    },
    showAbout: function () {
    	$.get('/nativehost/showAbout');
    },
    toggleFormBorder: function () {
        //
    },
    dockLeft: function () {
        //
    },
    dockRight: function () {
        //
    },
    ready: function () {
        //
    },
    platform: 'mac'
}
