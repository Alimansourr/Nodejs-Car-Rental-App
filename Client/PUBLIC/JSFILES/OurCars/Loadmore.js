$(document).ready(function () {
    $(".main").slice(0, 3).show();
    if ($(".content:hidden").length != 0) {
        $("#loadMore").show();
    }
    $("#loadMore").on('click', function (e) {
        e.preventDefault();
        $(".content:hidden").slice(0, 10).slideDown();
        if ($(".content:hidden").length == 0) {
            $("#loadMore").fadeOut('slow');
        }
    });
});