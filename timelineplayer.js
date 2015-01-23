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
 *
 * @param callback - the string name of the callback method
 * @param data - any data being used as the argument for the callback.
 */
TimelinePlayer.prototype.notifyObserver = function(callback, data) {
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
 * I considered moving the loading of the data out of this class, but
 * for simplicity I'm leaving it in.
 */
TimelinePlayer.prototype.load = function(path) {
    var result = {
        success:function(data) {
         this.data = data;
            this.notifyObserver("loadSucceed", data);
        },
        failure: function(jqxhr, textStatus, error) {
            this.notifyObserver("loadFail", error);
        }
    };
    $.getJSON(path).then(result.success.bind(this), result.failure.bind(this) );
};

/**
 * play - this method plays/resumes displaying the next event in the data
 *
 * The method calculates how long each event will be displayed and uses a timer
 * to trigger the display of the next event.  Also, if the playback is paused,
 * this method will resume playing from the time it left off.
 */
TimelinePlayer.prototype.play = function() {

    // check for no data loaded
    if ( this.data === null ) {
        return;
    }

    this.notifyObserver("playing");

    // check for currently paused
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
            this.timer = setTimeout(this.play.bind(this), this.timeForCurrentEvent);
        }

    } else {

        // resume playback
        var remainingTime = this.timeForCurrentEvent - this.elapsedTime - (this.pauseTime - this.startTime);
        this.elapsedTime += (this.pauseTime - this.startTime);
        this.startTime = performance.now();
        this.pauseTime = null;
        this.timer = setTimeout(this.play.bind(this), remainingTime);

    }
};

/**
 * pause - this method will pause the playback
 *
 * Essentially this means killing the timer and
 * capturing the time the pause occurred.  The
 * observer is notified.
 */
TimelinePlayer.prototype.pause = function() {
    this.pauseTime = performance.now();
    if ( this.timer !== null ) {
        clearTimeout(this.timer);
        this.timer = null;
    }
    this.notifyObserver("paused");
};

/**
 * reset - this method will reset the playback
 *
 * The method kills the timer if running, clears some
 * variables, and notifies the observer.
 */
TimelinePlayer.prototype.reset = function() {
    this.eventIndex = 0;
    this.pauseTime = null;
    if ( this.timer ) {
        clearTimeout(this.timer);
        this.timer = null;
    }
    this.notifyObserver("reset");
};
