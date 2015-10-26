/* winforms */
document.documentElement.className += ' winforms';

$(document).ready(function () {
    window.nativeHost.ready();

    $(document).on('keydown', function(e) {
        var keyCode = e.which || e.keyCode;
        if (e.altKey && keyCode == Keys.LEFT) {
            history.back();
        } else if (e.altKey && keyCode == Keys.RIGHT) {
            history.forward();
        }
    });
});