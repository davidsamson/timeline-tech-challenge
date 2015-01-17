/**
 * Timeline Player
 * David Scott Samson
 *
 * @param timePerYearMS - this contains the duration of each year on the timeline
 * @param observer - this is the object that receives the event callbacks
 */
var TimelinePlayer = function (timePerYearMS, observer) {
    this.timePerYearMS = timePerYearMS;
    this.observer = observer;

    this.data = null;
    this.timer = null;
    this.pauseTime = null;
    this.eventIndex = 0;
    this.startTime = 0;
    this.timeForCurrentEvent = 0;
    this.elapsedTime = 0;
};

/**
 * notifyObserver - this method sends callbacks to the observer
 * if present.
 *
 * I have decided to use an observer pattern to receive
 * events from this object.  I considered using a pub/sub, but this
 * was easier given the time constraints.
 */
TimelinePlayer.prototype.notifyObserver = function(callback,data) {
    if ( this.observer && this.observer.hasOwnProperty(callback) ) {
        this.observer[callback](data);
    }
};

/**
 * load - this method loads the data file from a JSON file
 * @param path
 *
 * I'm assuming that the data in the file is valid (correctly formatted)
 * and the events are in order by age and don't need sorting.
 */
TimelinePlayer.prototype.load = function(path) {
    var _this = this;
    var promise = $.getJSON(path);
    promise.then(function(data) {
        _this.data = data;
        _this.notifyObserver("loadSucceed", data);
    }, function(jqxhr, textStatus, error) {
        _this.notifyObserver("loadFail", error);
    });
};

/**
 * play - this method plays the next event in the data
 *
 */
TimelinePlayer.prototype.play = function() {

    // check for no data loaded
    if ( this.data === null ) {
        return;
    }

    this.notifyObserver("playing");

    // check for currently paused
    var _this = this;
    if ( this.pauseTime === null ) {

        // create text for display
        var text = "At age "+this.data.events[this.eventIndex]["age"]+", "+this.data["firstName"]+" "+this.data.events[this.eventIndex]["content"]+".";

        this.notifyObserver("displayEvent", { index:this.eventIndex, text:text });

        // check for completed all events
        if ( ++this.eventIndex >= this.data.events.length ) {
            this.notifyObserver("complete");
            return;
        }

        // reset time counters
        this.elapsedTime = 0;
        this.startTime = performance.now();

        // calculate total time for this event
        this.timeForCurrentEvent = (this.data.events[this.eventIndex]["age"] - this.data.events[this.eventIndex-1]["age"]) * this.timePerYearMS;

        // if not paused, set timer to play next event
        // (a pause could occur in the notifyObserver call above - as in testing)
        if ( this.pauseTime === null ) {
            this.timer = setTimeout(function() { _this.play(); }, this.timeForCurrentEvent);
        }

    } else {

        // resume playback
        var remainingTime = this.timeForCurrentEvent - this.elapsedTime - (this.pauseTime - this.startTime);
        this.elapsedTime += (this.pauseTime - this.startTime);
        this.startTime = performance.now();
        this.pauseTime = null;
        this.timer = setTimeout(function() { _this.play(); }, remainingTime);

    }
};

TimelinePlayer.prototype.pause = function() {
    this.pauseTime = performance.now();
    if ( this.timer !== null ) {
        clearTimeout(this.timer);
        this.timer = null;
    }
    this.notifyObserver("paused");
};

TimelinePlayer.prototype.reset = function() {
    this.eventIndex = 0;
    this.pauseTime = null;
    if ( this.timer ) {
        clearTimeout(this.timer);
        this.timer = null;
    }
    this.notifyObserver("reset");
};
