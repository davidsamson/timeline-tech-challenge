var state = 0;

// setup player for 2s (2000ms) per year
var player = new TimelinePlayer(2000,
    {
        loadSucceed: function() { $('#button').removeAttr('disabled'); },
        loadFail: function() {$('#box').html("Failed to load timeline data.")},
        playing: function() { $('#button').html("Pause"); state=1; },
        paused: function() { $('#button').html("Play");  state=0; },
        reset: function() { $('#button').html("Play"); $('#box').html(""); state=0; },
        complete: function() { $('#button').html("Reset");  state=2; },
        displayEvent: function(event) {
            $('#box').css({"opacity":0})
            .html(event.text)
            .fadeTo("slow",1);
        }
    });

// load-up the event data
player.load("timeline.json");

$('#button').click( function() {
    switch(state) {
        case 0: player.play(); break;
        case 1: player.pause(); break;
        case 2: player.reset(); break;
    }
});