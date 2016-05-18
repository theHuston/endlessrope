"use strict";
const EventEmitter = require('events').EventEmitter;
const List = require('../lib/DoublyLinkedList');
const Timer = require('/util/stopwatch.js');
const signal = require("./signal");
////////////////////////////////////////////////////////////////////////////////
const STATUS = {
    IDLE: 0,
    ACTIVE: 1,
    PAUSED: 2
};
////////////////////////////////////////////////////////////////////////////////
class Session extends EventEmitter {
    constructor(mode, timeout) {
        super();

        this.history = new List();
        this.timer = new Timer();
        this._timeout = {
            elapsed: 0,
            limit: timeout
        };
        this._defualtMode = mode;
        this._status = STATUS.IDLE;
        this.update_handler = this.update.bind(this);
        this.distance = 0;

        signal.on('measure', this.update_handler);
    }
    get isActive() {
        return this._status === STATUS.ACTIVE;
    }
    get isIdle() {
        return this._status === STATUS.IDLE;
    }
    get isPaused() {
        return this._status === STATUS.PAUSED;
    }
    get isTimedOut() {

    }
    update(d) {
        if (this.isPaused) {
            if ()
        }
        if (this.isActive) {
            this.distance = (d.distance = this.distance + d.distance);
            this.history.push(d);
            this.emit('update', d);
        }
        return this;
    }
    start() {
        if (!this.isActive) {
            this.distance = 0;
            this.timer.start();
            this.mode.start();
            this._status = STATUS.ACTIVE;
            this.emit("start");
        }
        return this;
    }
    pause() {
        if (this.isActive) {
            this._status = STATUS.PAUSED;
        }
        return this;
    }
    reset() {
        if (this.isActive) {
            this.stop();
            this.start();
            this.emit('reset');
        }
        return this;
    }
    stop() {
        if (this.isActive) {
            this.timer.stop();
            this.history.clear();
            this._status = STATUS.IDLE;
            this.emit('stop');
        }
        return this;
    }
    changeMode(Mode) {
        if (this.isActive) this.stop();
        this._mode = new Mode();
        return this;

    }
}
////////////////////////////////////////////////////////////////////////////////
