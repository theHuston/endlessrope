"use strict";
const calc              = require("./calc.js")
const Speed             = require("./speed.js");
const Distance          = require("./distance.js");
const EventEmitter      = require("events").EventEmitter;
const Stopwatch         = require('timer-stopwatch');

const activities = {
    FREECLIMB() {
        stopwatch = new Stopwatch();
    },
    TIMEDCLIMB(option) {
        this.stopwatch = new Stopwatch(option);
        this.stopwatch.on('done', function() {
            console.log('Timer is complete');
            io.emit('finishline');
        });
    },
    DISTANCECLIMB(option) {
        stopwatch = new Stopwatch();
        _climbingDistance = option;
    }
};
class Race extends EventEmitter {
    constructor() {
        this._racing     = false             ;
        this._started    = false             ;
        this._activity   = "FREECLIMB"       ;
        this.stopwatch   = new Stopwatch()   ;
        this.speed       = null              ;
        this.distance    = null              ;
    }
    start(activity, option) {
        console.log("On your mark.");
        this.speed      = new Speed();
        this._started   = false;

        this._activity  = activity;

        activities[activity].call(this.option);
        this.emit('start');
    }
    finish(_player) {
        this.stopwatch.stop();
        this.emit('finish');
    }
}
module.exports = Race;
