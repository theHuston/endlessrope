"use strict";
const Speed = require("./speed.js");
const Gpio    = require('onoff').Gpio             ; 
require("console.table");
//const sensor  = new Gpio(14, 'in', 'falling')     ;
//const httpServer = require("./router.js");
const Sensor = require("./sensor.js");
function mainLoop(s) {
    s.fromStep();
    setImmediate(mainLoop.bind(null,s))
}
function observeLoop(s,i) {
    var i = i||0;
    var t = Math.round(Math.abs(Math.sin(i/100)*100))+100;
    s.observe();
    setTimeout(function() {
        console.log("time",t)
        observeLoop(s,++i);
    },t);
}
///////////////////////////////////////////
//fromStep
///////////////////////////////////////////
let speed = new Speed();
speed.observe();
setImmediate(mainLoop.bind(null,speed))
let sensor = new Sensor(250)
.start()
.on("interupt",function(f) {
  speed.observe();
});
///////////////////////////////////////////
//fromHertz
///////////////////////////////////////////
let speed2 = new Speed();
speed.observe();
let sensor2 = new Sensor(250);
sensor2.start()
.on("update",function(f) {
  speed2.fromHertz(f);
  speed2.observe();
  console.table([
    {
      avg    :speed.mean,
      current:speed.current,
      max    :speed.max,
    },
    {
      avg    :speed2.mean,
      current:speed2.current,
      max    :speed2.max
    }
  ]);
});
function logValues(name,s) {
  console.log(name,"avg    ",s.mean);
  console.log(name,'current',s.current);
  console.log(name,'max    ',s.max);
}
