/*jslint browser: true*/
/*global  $*/
/*global  ko*/
(function () {
    "use strict";
    $(document).ready(function () {
        var ViewModel = function () {
            var self = this;
            self.songs = [];
            self.step = function (result) {
                $("table.track_list > tbody > tr", result).each(function () {
                    self.songs.push({
                        name: $("td.song_name > a", this).first().text(),
                        artist: $("td.song_name > a.artist_name", this).first().text()
                    });
                });
                if ($("a.p_redirect_l", this).size() > 0) {
                    var url = $("a.p_redirect_l", this).first().attr("href");
                    $.get(url, self.step);
                }
            };
            self.run = function () {
                self.songs = [];
                $.get("http://www.xiami.com/space/lib-song", self.step);
            };
        };
        ko.applyBindings(new ViewModel());
    });
}());