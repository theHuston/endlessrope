'use strict';

const EventEmitter = require('events').EventEmitter;

const STATUS = {
    STOPPED: 0,
    RUNNING: 1,
    COMPLETE: 2,
};

class Timer extends EventEmitter {
    constructor(interval, duration) {
        super();
        this._status = STATUS.STOPPED;
        this._interval = interval;
        this._duration = duration || Infinity;
        this._start = 0;
        this._elapsed = 0;
        this._tick = null;
        this._ticks = 0;
        this._call = this.tick.bind(this);
    }
    get isLimited() {
        return this._duration !== Infinity;
    }
    get limit() {
        return this._duration;
    }
    get elapsed() {
        return this._elapsed;
    }
    get isRunning() {
        return this._status === STATUS.RUNNING;
    }
    get isNewInterval() {
        return (this._elapsed > this._interval) && (Math.floor(this._elapsed / this._interval) > this._ticks);
    }
    tick() {
        if (this.isNewInterval) {
            //console.log(this._elapsed, this._ticks);
            this._ticks++;
            this.emit('tick');
        }
        this._elapsed = Date.now() - this._start;

        if (this.isLimited && this._elapsed > this._duration) {
            return this.stop();
        }

        this._tick = setImmediate(this._call);
        return this;
    }

    start() {
        if (!this.isRunning) {
            this._status = STATUS.RUNNING;
            this._start = Date.now();
            this._tick = setImmediate(this._call);
            this.emit('start');
        }
        return this;
    }
    stop() {
        if (this.isRunning) {
            clearImmediate(this._tick);
            this._status = STATUS.STOPPED;
            this._elapsed = Date.now() - this._start;
            this.emit('stop');
        }
        return this;
    }
    reset() {
        this.stop();
        this._start = 0;
        this._elapsed = 0;
        this.start();
    }
}

let t = new Timer(2, 100)
    //.on( 'tick', ()=>( console.log('time:',t.elapsed) ))
    .on('start', () => (console.log('start')))
    .on('stop', () => (console.log('stop', t._ticks, 10000 / 1)))
    .start();
module.exports = Timer;
