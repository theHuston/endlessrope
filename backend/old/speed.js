'use strict';
//const Gpio = require('onoff').Gpio, sensor = new Gpio(14, 'in', 'falling');
const DoublyLinkedList = require("../lib/DoublyLinkedList.js").DoublyLinkedList;
const g = 36;
const C = 18.849;
const di = C / g;
const EventEmitter = require("events").EventEmitter;

function nanosecondDiff(start) {
    var diff = process.hrtime(start);
    return diff[0] * 1e9 + diff[1];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

class Speed extends EventEmitter {
    constructor() {
        super();
        this.lastObserved = null
        this.calculated = new DoublyLinkedList([
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ]);
        this.max = 0;
        this.mean = 0;
        this.current = 0;
    }
    observe() {
        this.lastObserved = process.hrtime();
        this.calculated.pop();
        this.calculated.unshift(this.current);

        this.mean = this.calculated.reduce(((x, v) => x + v), 0) / this.calculated.length;

        if (this.current > this.max) {
            this.max = this.current;
        }
        console.log("di", di);
        console.log("avg", this.mean);
        console.log('current', this.current);
        console.log('max', this.max);
        this.emit("observe")
    }
    calculate() {
        let i = nanosecondDiff(this.lastObserved);
        this.current = (((di / i) * 1000000000) / 12) * 60;
        this.emit('calculate')
    }
}
module.exports = Speed;
