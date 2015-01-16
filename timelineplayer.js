var TimelinePlayer = function (timePerYearMS, observer) {
    this.timePerYearMS = timePerYearMS;
    this.observer = observer;

    this.data = null;
    this.pauseTime = 0;
    this.eventIndex = 0;
    this.currentYear = 0;
    this.timer = -1;
    this.startTime = 0;
    this.pauseTime = -1;
    this.timeForCurrentEvent = 0;
    this.elapsedTime = 0;
};

TimelinePlayer.prototype.notifyObserver = function(callback,data) {
    if ( this.observer && this.observer.hasOwnProperty(callback) ) {
        this.observer[callback](data);
    }
};

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

TimelinePlayer.prototype.play = function() {
    // check for no data loaded
    if ( this.data === null ) {
        return;
    }

    this.notifyObserver("playing");

    // check for currently paused
    if ( this.pauseTime === -1 ) {

        // check for playing event
        if ( this.currentYear == this.data.events[this.eventIndex]["age"] ) {
            var text = "At age "+this.data.events[this.eventIndex]["age"]+", "+this.data["firstName"]+" "+this.data.events[this.eventIndex]["content"]+".";

            this.notifyObserver("displayEvent",{index:this.eventIndex,text:text});

            this.elapsedTime = 0;
            this.startTime = performance.now();
            this.eventIndex++;
            if ( this.eventIndex >= this.data.events.length ) {
                this.notifyObserver("complete");
                return;
            }
            this.timeForCurrentEvent = (this.data.events[this.eventIndex]["age"] - this.data.events[this.eventIndex-1]["age"]) * this.timePerYearMS;
        }

        var _this = this;
        if ( this.pauseTime === -1 ) {
            this.timer = setTimeout(function() { _this.play(); }, this.timePerYearMS);
            this.currentYear++;
        }

    } else { // resume
        var dt = this.timeForCurrentEvent - this.elapsedTime - (this.pauseTime - this.startTime);
        this.elapsedTime += (this.pauseTime - this.startTime);
        this.startTime = performance.now();
        this.pauseTime = -1;
        this.timer = setTimeout(this.play(), dt);

    }
};

TimelinePlayer.prototype.pause = function() {
    this.notifyObserver("paused");
    this.pauseTime = performance.now();
    if ( this.timer !== -1 ) {
        clearTimeout(this.timer);
        this.timer = -1;
    }
};

TimelinePlayer.prototype.reset = function() {
    this.eventIndex = 0;
    this.currentYear = 0;
    this.pauseTime = -1;
    if ( this.timer ) {
        clearTimeout(this.timer);
        this.timer = -1;
    }
};
