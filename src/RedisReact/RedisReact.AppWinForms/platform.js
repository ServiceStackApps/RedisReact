/* winforms */
document.documentElement.className += ' winforms'​​​​;

$(document).ready(function () {
    window.nativeHost.ready();

    $(document).on('keydown', function(e) {
        if (e.altKey && e.which == Keys.LEFT) {
            history.back();
        } else if (e.altKey && e.which == Keys.RIGHT) {
            history.forward();
        }
    });
});