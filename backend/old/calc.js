"use strict";
const TEETH                 = 36        ;
const PI                    = 3.1415    ;
const IN_PER_MS_TO_MPH      = 5.68181   ;
const IN_TO_CM              = 2.54      ;
const CM_TO_KM              = 100000    ;
const IN_TO_MILES           = 63360     ;
const MPH_TO_KPH            = 1.60934   ;
const SEC_TO_HR             = 3600      ;
const MIN_SPEED_MS          = 3000      ;
const REFRESH_SPEED_MS      = 1000      ; //125
const _wheelCircumference   = 47        ;
const _climbingDistance     = 330       ;

const FOOT_IN_INCHES        = 12        ;
const MINUTE_IN_SECONDS     = 60        ;

const sqrt = Math.sqrt.bind(Math);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let RunningAverage  = require('running-average');

let runningAverage  = new RunningAverage()  ;
let counter         = 0                     ;
let displayUp       = false                 ;
let speedometer     = 0                     ;
let theDistance     = 0                     ;
let stopwatch       = new Stopwatch()       ;

let distanceInterval;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
distanceInterval = setInterval(function() {

	processMovement(counter);

	if (!_isStarted) {
		if (counter > 2) {
			_isStarted = true;
			theyStarted();
		}
	}
	counter = 0;

}, REFRESH_SPEED_MS);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let stopwatchOptions = {
	refreshRateMS : REFRESH_SPEED_MS, // How often the clock should be updated
	almostDoneMS : 10000,    // When counting down - this event will fire with this many milliseconds remaining on the clock
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let _defaultAvgSpeeds   = [0, 0, 0, 0, 0, 0, 0, 0];
let _totalInches        = 0;
let _lastFPM            = 0;
//let _climbingTime       = 120000;
let _prevSpeedTime      = 0;
let _timeout            = 35;
let _timeoutCount       = 0;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let distance = {
    _total:0,
    updateDistance(total) {
        if (race._activity == "DISTANCECLIMB") {
            this._total = _climbingDistance - total;
        } else if (race._activity == "TIMEDCLIMB") {
            if (race._started) {
                this._total = total;
            } else {
                this._total = 0;
            }
        } else {
            this._total = total;
        }
    }
};
let time = {
};
let speed = {
    max         : 0                     ,
    avg         : 0                     ,
    prev        : 0                     ,
    accumulated : _defaultAvgSpeeds     ,
    current     : 0                     ,
    resetAccumulatedValues() {
        return this.accumulated = _defaultAvgSpeeds.slice();
    },
    calcAvg() {
        return this.avg = this.prev
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function inchesToFeet(l) {
    return l/FOOT_IN_INCHES;
};
function secondsToMinutes(s) {
    return s/MINUTE_IN_SECONDS;
}
function checkPullState() {
    if (_lastFPM.toFixed(0) > 0) {
        runningAverage.push(_lastFPM);
        _timeoutCount = 0;
    } else {
        speed.resetAccumulatedValues();
        speed.current = 0;

        _timeoutCount++;
        if (_timeoutCount >= _timeout) {
            theyStopped();
        }
    }
}
function average(data) {
  return data
      .reduce(((sum, value) => sum + value), 0) 
      / data.length;
},
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TIMEDCLIMB, DISTANCECLIMB, CONFIGURE
module.exports = {
    processMovement(pulses) {

        pulses /= 2;

        let RPS = (pulses / TEETH ) * 8;
        //  1/8 for update speed

        let RPM = secondsToMinutes(RPS);

        //FEET(6 * PI);//
        
        

        speed.prev = speedometer;//((RPM * _wheelCircumference ) * 0.0833);

        //Check to make sure their still pulling

        //Total DISTANCE
        distance.total += inchesToFeet(((pulses / TEETH ) * _wheelCircumference) );

        //TOP SPEED
        if (speed.prev > speed.max) {
            speed.max = speed.prev;
        }

        //AVG SPEED
        speed.avg = runningAverage.getAverage();

        speed.accumulated.unshift(_lastFPM);
        speed.accumulated.pop();

        speed.current = speedometer;//average(_avgSpeeds);

        /// Update distance based on activity
        distance.update(_totalInches)

        //SEND IT OFF
        io.emit('speed', speed.current, distance._total, speed.max, speed.avg, stopwatch.ms);

    },
    stdDev(values) {
       return sqrt(average(values.map((value) => sqrt(value - average(values)))));
    },
};
