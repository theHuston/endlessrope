'use strict';
const Processor = require("./processor.js");
const Sensor = require("./sensor.js");
////////////////////////////////////////////////////////////////////////////////
const sensor = new Sensor(250);
const processor = new Processor(sensor);
////////////////////////////////////////////////////////////////////////////////

sensor
    .on('update', function(hz) {
        //have to measure, and observe
        processor.observe(hz);
        processor.fromHertz(hz);
    });
processor.on("observe",function(o) {
  console.log("observed",o);
});
sensor.start();

////////////////////////////////////////////////////////////////////////////////
module.exports = processor;
