'use strict';
const EventEmitter = require("events").EventEmitter;
const LinkedList = require("../../lib/DoublyLinkedList.js").DoublyLinkedList;
//const Sensor            = require( "./sensor.js" );
const math = require('../util/math.js');
const util = require('../util/util.js');

const g = 36;
const cC = 18.849;
var sight = cC - (cC * 1.2805);
var C = cC + sight;
const di = C / g;

class Processor extends EventEmitter {
    constructor(sensor) {
        super();

        this.sensor = sensor;
        this.lastObserved = null;
        this._max = 0;
        this._mean = math.mavg();
        this._measurements = new LinkedList([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        this.steps = 0;
        this.current = 0;
        this._circumfrance = C;
        this._teeth = g;
        this._toothInterval = di;
    }
    get max() {
        return this._max;
    }
    set max(v) {
        this._max = (v > this._max) ? v : this._max;
    }
    get mean() {
        return this._mean.value;
    }
    reset() {
        this._max = 0;
        this._mean = math.mavg();
        this._measurements = new LinkedList([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        this.current = 0;
        this.steps = 0;
        return this;
    }
    observe(hz) {
        this.steps = 0;
        this.lastObserved = process.hrtime();

        //console.log("observed data",hz)
        let o = {
            speed: {
                current: this.current,
                max: this.max,
                average: this.mean
            },
            distance: (hz.frequency * (hz.interval / 1000) * (C ))/ 12
        };
        this.emit("observe", o);
        return this;
    }
    fromHertz(hz) {
        this.current = ((C * hz.frequency) / 12) * 60;

        this.emit('hertz', this.current);
        this.emit('measure', this.current);
        return this;
    }
    step() {
        this.steps++;
        return this;
    }
    fromStep() {
        let i = util.nanosecond(this.lastObserved);
        var measurement = ((((di*this.steps) / i) * 1000000000) / 12) * 60;
        this._measurements.push(measurement);
        this._measurements.shift();
        var maxReading = 0;
        this._measurements.each(x => maxReading = (maxReading <x?x:maxReading))
        this.current = this._measurements .reduce(((x,v) => (maxReading <x?(v):(x+v))),0)/this._measurements.length;
        //this.current = measurement;
        this.max = this.current;
        this._mean(this.current);
        //if((this.current*5)+50 > measurement) {
            //this.current = measurement;
            //this.max = this.current;
            //this._mean(this.current);
        //}

        this.emit('step', this.current);
        this.emit('measure', this.current);
        return this;
    }
}
module.exports = Processor;
