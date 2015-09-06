window.nativeHost = {
    quit: function () {
        $.get('/nativehost/quit');
        setTimeout(function() {
            window.close();
        });
    },
    showAbout: function () {
        alert('ReactChat - ServiceStack + ReactJS');
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
    platform: 'console'
}