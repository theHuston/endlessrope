'use strict';
const EventEmitter = require('events').EventEmitter;
const Gpio = require('onoff').Gpio;
const TEETH = 36; // number of teeth on gear

class Sensor extends EventEmitter {
    constructor(rate) {
        super();
        this._device = new Gpio(18, 'in', 'both');
        this._tick = null;

        this._rate = rate; // will emit update events every X milliseconds
        this._teeth = TEETH; // number of teeth on gear
        this._time = 0; // start time of device signal consumption
        this._count = 0; // number of times swicth state has toggled durring device signal consumption

        this._device_callback = this.consume_device_signal.bind(this);
        this._update_callback = this.update.bind(this);

    }
    start() {
        this._time = Date.now();
        this._device.watch(this._device_callback); // start consuming device signal
        this._tick = setInterval(this._update_callback, this._rate); // start emiting events
        return this;
    }
    stop() {
        clearInterval(this._tick); // stop emiting events
        this._device.unwatch(this._callback); // stop consuming device signal
        return this;
    }
    get interval() {
        // length in ms of consumption interval

        return (this._interval = Date.now() - this._time);
    }
    get revs() {
        // gear revolutions durring consumption interval

        return this._count / this._teeth;
    }
    get hertz() {
        // revolutions per second

        //  revolutions               ? = (revolutions*second)/interval
        //  -----------   === -----------
        //     interval          second

        //    6       60  === (6*1000)/100 === 6000/100 === 60
        //  --- === ----
        //  100     1000

        return (this._hertz = (this.revs) * 1000 / (this.interval > 0?this._interval:1));
    }
    consume_device_signal(err, value) {
        if (err) return this.emit('error', err);
        // more error handling needed ?
        // device's switch state has toggled
        this.emit("interupt", this.measurement);
        this._count++;
    }
    get measurement() {
        return {
            frequency: this.hertz,
            interval: this._interval,
        }
    }
    update() {
        // publish current rate of gear spin to listeners
        this.emit('update', this.measurement);

        // reset for next consumption interval
        this._count = 0;
        this._time = Date.now();
    }
}
module.exports = Sensor;
