
// I'm stubbing the performance counter to use getTime() for tests.
var performance = {
    now: function() { var d=new Date(); return d.getTime(); }
};

/*
    I'm going to recreate the player for each test and load the
    data when needed for the test.  I'm aware that I could inject
    test data here instead, given the time constraints, I decided
    to go with the file data.
 */
describe("timeline player", function () {

    var timelinePlayer;

    beforeEach(function() {
        timelinePlayer = new TimelinePlayer(2000);
    });

    afterEach(function() {
        timelinePlayer.reset();
        timelinePlayer.observer = null;
        timelinePlayer = null;
    });

    it("loads the timeline data file", function(done) {
        timelinePlayer.observer = {
            loadSucceed: function() {
                expect(timelinePlayer.data).toBeDefined();
                expect(timelinePlayer.data.firstName).toEqual("Chip");
                done();
            },
            loadFail: function() {
                fail();
                done();
            }
        };

        timelinePlayer.load('timeline.json');
    });

    it("returns an error when timeline does not load", function(done) {
        timelinePlayer.observer = {
            loadSucceed: function() {
                fail();
                done();
            },
            loadFail: function(error) {
                expect(error).toBeDefined();
                done();
            }
        };

        timelinePlayer.load('nothere.json');
    });

    it ("notifies the observer when playing", function(done) {

        timelinePlayer.observer = {
            loadSucceed: function() {
                timelinePlayer.play();
            },
            loadFail: function() {
                fail();
                done();
            },
            playing: function() {
                expect(true).toBe(true);
                done();
            }
        };

        timelinePlayer.load('timeline.json');
    });

    it ("notifies the observer when paused", function(done) {
        timelinePlayer.observer = {
            loadSucceed: function() {
                timelinePlayer.play();
                timelinePlayer.pause();
            },
            loadFail: function() {
                fail();
                done();
            },
            paused: function() {
                expect(timelinePlayer.timer).toBeNull();
                done();
            }
        };

        timelinePlayer.load('timeline.json');
    });

    it ("notifies the observer when complete", function(done) {

        timelinePlayer.observer = {
            loadSucceed: function() {
                timelinePlayer.play();
            },
            loadFail: function() {
                fail();
                done();
            },
            complete: function() {
                expect(true).toBe(true);
                done();
            }
        };

        timelinePlayer.timePerYearMS = 10;
        timelinePlayer.load('timeline.json');
    });

    it ("notifies the observer when reset", function(done) {

        timelinePlayer.observer = {
            loadSucceed: function() {
                timelinePlayer.play();
            },
            loadFail: function() {
                fail();
                done();
            },
            complete: function() {
                timelinePlayer.reset();
            },
            reset: function() {
                expect(timelinePlayer.eventIndex).toBe(0);
                expect(timelinePlayer.pauseTime).toBeNull();
                expect(timelinePlayer.timer).toBeNull();
                done();
            }
        };

        timelinePlayer.timePerYearMS = 10;
        timelinePlayer.load('timeline.json');
    });


    it ("generates the text 'At age [age], [firstname] [event].' from each event when played", function(done) {
        timelinePlayer.observer = {
            loadSucceed: function() {
                timelinePlayer.play();
            },
            loadFail: function() {
                fail();
                done();
            },
            displayEvent: function(event) {
                timelinePlayer.pause();
                expect(event.text).toEqual("At age "+timelinePlayer.data.events[0]["age"]+", "+timelinePlayer.data["firstName"]+" "+timelinePlayer.data.events[0]["content"]+".");
                done();
            }
        };

        timelinePlayer.load('timeline.json');
    });

    it ("displays each year of the timeline for n milliseconds", function(done) {

        var startTime = 0;
        timelinePlayer.observer = {
            loadSucceed: function() {
                var d = new Date();
                startTime = d.getTime();
                timelinePlayer.play();
            },
            loadFail: function() {
                fail();
                done();
            },
            complete: function() {
                var d = new Date();
                var endTime = d.getTime() - startTime;
                expect(Math.floor(endTime/100)).toEqual(timelinePlayer.data.events[timelinePlayer.data.events.length-1]["age"]);
                done();
            }
        };

        timelinePlayer.timePerYearMS = 100;
        timelinePlayer.load('timeline.json');
    });

    it ("displays each year of the timeline for n milliseconds when paused and resumed", function(done) {

        var startTime = 0;
        var resumed = false;
        timelinePlayer.observer = {
            loadSucceed: function() {
                var d = new Date();
                startTime = d.getTime();
                timelinePlayer.play();
            },
            loadFail: function() {
                fail();
                done();
            },
            displayEvent: function(event) {
                if ( event.index === 3 && !resumed ) {
                    timelinePlayer.pause();
                    resumed = true;
                    setTimeout(function() { timelinePlayer.play(); } , 500); //resume after 1/2 second
                }
            },
            complete: function() {
                var d = new Date();
                var endTime = d.getTime() - startTime - 500; // subtract time paused
                expect(Math.floor(endTime/100)).toEqual(timelinePlayer.data.events[timelinePlayer.data.events.length-1]["age"]);
                done();
            }
        };

        timelinePlayer.timePerYearMS = 100;
        timelinePlayer.load('timeline.json');
    });


});
