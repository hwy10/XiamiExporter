/*jslint browser: true*/
/*global  $*/
/*global  ko*/
/*global  copy*/
/*global  window*/
(function () {
    "use strict";
    $(document).ready(function () {
        var ViewModel = function () {
            var self = this;
            self.songs = ko.observableArray(JSON.parse(localStorage.getItem("songs")) || []);
            self.running = ko.observable(false);
            self.step = function (result) {
                $("table.track_list > tbody > tr", result).each(function () {
                    self.songs.push({
                        name: $("td.song_name > a", this).first().text(),
                        artist: $("td.song_name > a.artist_name", this).first().text()
                    });
                });
                if ($("a.p_redirect_l", result).size() > 0) {
                    var url = "http://www.xiami.com" + $("a.p_redirect_l", result).first().attr("href");
                    $.get(url, self.step);
                } else {
                    var so = $("<so></so>");
                    self.songs().forEach(function (e) {
                        var song = $("<so></so>").attr("name", e.name).attr("artist", e.artist);
                        so.append(song);
                    });
                    localStorage.setItem("kwl", so.prop("outerHTML"));
                    localStorage.setItem("songs", JSON.stringify(self.songs()));
                    self.running(false);
                }
            };
            self.run = function () {
                self.songs.removeAll();
                self.running(true);
                $.get("http://www.xiami.com/space/lib-song", self.step);
            };
        };
        ko.applyBindings(new ViewModel());
    });
}());