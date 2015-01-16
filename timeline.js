var mode = 0;
var player = new TimelinePlayer(2000,
    {
        loadSucceed: function() { $('#button').removeAttr('disabled'); },
        loadFail: function() {$('#box').html("Failed to load timeline data.")},
        playing: function() { $('#button').html("Pause"); mode=1; },
        paused: function() { $('#button').html("Play");  mode=0; },
        complete: function() { $('#button').html("Reset");  mode=2; },
        displayEvent: function(event) {
            $('#box').css({"opacity":0})
            .html(event.text)
            .fadeTo("slow",1);
        }
    });

player.load("timeline.json");

function onClick() {
    switch(mode) {
        case 0: player.play(); break;
        case 1: player.pause(); break;
        case 2: player.reset(); $('#button').html("Play"); $('#box').html(""); mode=0; break;
    }
}

$('#button').click( onClick );