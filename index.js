"use strict";
var express = require('express');

var app = express();
// Create express by calling the prototype in var express

var os = require('os');
var exec = require('child_process').exec;

var http = require('http').Server(app);
var io = require('socket.io')(http);

var Stopwatch = require('timer-stopwatch');
var EventEmitter = require("events").EventEmitter;
var Sensor = require("./backend/signal/sensor.js");
var sensor = new Sensor(250);
var Processor = require("./backend/signal/processor.js");
var processor = new Processor(sensor);
var Timer = require("./backend/util/timer/timer.js");
require("console.table");

var AutoUpdater = require('auto-updater');
var v;
var old_v;

var pjson = require('./package.json');
console.log(pjson.version);

var version = pjson.version;

var i = 0;
/*var sensorInputs = new Timer(1,10)
 .on("stop",function stop() {
 console.log("sensor inputs")
 sensor.consume_device_signal(null)
 //sensorInputs.start();
 var t = Math.round(Math.abs(Math.sin(++i/100)*100))*0.40+1;
 console.log("next timer",t);
 console.log("timer i",i);
 sensorInputs = new Timer(1,t).on("stop",stop).start();
 }).start();*/
var sensorInputs = new Timer(1, 10); sensorInputs;
function startTesting() {
	sensorInputs.on("stop", function stop() {
		//console.log("sensor inputs")
		sensor.consume_device_signal(null);
		sensorInputs.start();
	}).start();
};
function stopTesting() {
	sensorInputs.removeAllListeners("stop");
	sensorInputs.stop();
}

function resetState(activity) {
	processor.reset();
	_topSpeed = 0;
	_avgSpeed = 0;
	_isStarted = false;

	//_currentActivity = activity||"FREECLIMB";

	theDistance = 0;
	//stopTesting();
};

// Get the module
/*
• Timer will start on pull when the "Finished" Race overview is showing.

• The reset doesn't reset the distance on the timed climb.

• The Mileage presets on the distance page climb only work when the timer is running.
*/

//var robot = require("robotjs");

var counter = 0;
var currentSpeed = 0;
var _climbingDistance = 330;
var _climbingTime = 10000;

var displayUp = false;

var speedometer = 0;

var REFRESH_SPEED_MS = 1000;
//125
//15000;

var _timeout = 5;
var _timeoutCount = 0;
var _currentActivity = "FREECLIMB";
// TIMEDCLIMB, DISTANCECLIMB, CONFIGURE
var stopwatch = new Stopwatch();
var stopwatchOptions = {
	refreshRateMS : REFRESH_SPEED_MS, // How often the clock should be updated
	almostDoneMS : 10000, // When counting down - this event will fire with this many milliseconds remaining on the clock
};

var _topSpeed = 0;
var _avgSpeed = 0;

var theDistance = 0;

var _racing = false;
var _isStarted = false;

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
	for (var k2 in interfaces[k]) {
		var address = interfaces[k][k2];
		if (address.family === 'IPv4' && !address.internal) {
			addresses.push(address.address);
		}
	}
}

console.log(addresses);

app.use(express.static(__dirname + '/frontend'));
app.get('/', function(req, res) {
	res.sendFile('./index.html');
});

var testTimer;
io.on('connection', function(socket) {
	resetState();
	console.log('a user connected');

	io.emit('init', addresses[0], version);

	socket.on('disconnect', function() {
		resetState();
		console.log('user disconnected');

	});

	socket.on('finishline', function(player) {
		console.log("finishline event");
		finishLine(player);
	});

	socket.on('please shutdown', function(msg) {
		console.log("Closing");

		exec("sudo poweroff", function(error, stdout, stderr) {
			if (error !== null) {
				console.log("exec errror: " + error);
			}
		});
	});

	socket.on('on your mark', function(activity, option) {
		console.log("On your mark.");
		resetState();
		_currentActivity = activity;
		switch (activity) {
		case "FREECLIMB":
			console.log("new freeclimb");
			stopwatch = new Stopwatch();
			break;
		case "TIMEDCLIMB":
			console.log("new timed climb", _climbingTime);
			_climbingTime = option;
			stopwatch = new Stopwatch(_climbingTime);
			stopwatch.on('done', function() {
				console.log('Timer is complete');
				io.emit('finishline');
				finishLine();
			});
			break;
		case "DISTANCECLIMB":
			console.log("distance climb");
			stopwatch = new Stopwatch();
			theDistance = option;
			_climbingDistance = option;
			break;
		default:
		//nothing
		}
		//clearTimeout(testTimer);
		//testTimer = setTimeout(startTesting,10000);
	});
});

function finishLine(_player) {
	console.log("finish line");
	stopwatch.stop();
	//setTimeout(resetState,10000);
	//resetState();
	//stopTesting();
}

// They started pulling
function theyStarted() {

	stopwatch.start();
	io.emit('gun shot', "Here'll we go!");
	console.log('user started pulling');
}

// They stopped pulling
function theyStopped() {
	if (_currentActivity == "FREECLIMB") {
		stopwatch.stop();
	}
	_isStarted = false;
}

var isPulling = false;
//Helper functions
function checkPullStatus() {
	if (currentSpeed.toFixed(0) > 2) {
		isPulling = true;
		_timeoutCount = 0;
	} else {
		currentSpeed = 0;
		_timeoutCount++;
		if (_timeoutCount >= _timeout) {
			isPulling = false;
			theyStopped();
		}
	}
}

function updateDistance(o) {
	//console.log("the distance", theDistance);
	console.log("activity", _currentActivity);
	console.log("distance interval", o.distance);
	if (_currentActivity == "DISTANCECLIMB") {
		if (_isStarted) {
			theDistance = theDistance - o.distance;
		} else {
			theDistance = 0;
		}
	} else if (_currentActivity == "TIMEDCLIMB") {
		if (_isStarted) {
			theDistance += o.distance;
		} else {
			theDistance = 0;
		}
	} else {
		theDistance = o.distance + theDistance;
	}
	console.log("distance updated", theDistance);
}

// The callback passed to watch will be called when the button on GPIO #4 is
// pressed.
http.listen(8080, function() {
	console.log('listening on *:8080');
	exec("DISPLAY=:0 kweb -KJHB 'http://localhost:8080'", function(error, stdout, stderr) {
		//exec("DISPLAY=:0 chromium-browser --kiosk --enable-kiosk-mode --enabled --touch-events --touch-events-ui --disable-ipv6 --allow-file-access-from-files --disable-java --disable-restore-session-state --disable-sync --disable-translate --disk-cache-size=1 --media-cache-size=1 http://localhost:8080", function(error, stdout, stderr) {
		//exec("DISPLAY=:0 chromium-browser  --touch-events --disable-touch-drag-drop --disable-restore-session-state --incognito  --kiosk --start-maximized http://localhost:8080", function(error, stdout, stderr) {
		console.log("stdout: " + stdout);
		console.log("stderr: " + stderr);
		displayUp = true;
		if (error !== null) {
			console.log("exec errror: " + error);
		}
	});

	// Start checking
	autoupdater.fire('check');

	sensor.on('update', function(hz) {

		//console.log("frequency",hz)
		//console.log("rps",sensor.revs)
		if (!_isStarted) {
			if (hz.frequency > 0) {
				_isStarted = true;
				theyStarted();
			}
		}
		processor.fromHertz(hz).observe(hz);
	}).on("interupt", function(hz) {
		processor.step().fromStep();

		currentSpeed = processor.current;
		//console.log("current speed",currentSpeed);
		io.emit('speed', currentSpeed, theDistance, _topSpeed, _avgSpeed, stopwatch.ms);

	}).on("error", function(err) {
		console.log("SENSOR ERROR:", err);
	}).start();
	processor.on("observe", function(o) {
		//console.log("observed", o);
		checkPullStatus();
		if (isPulling) {
			currentSpeed = processor.current;
			_topSpeed = processor.max;
			_avgSpeed = processor._mean().value;
			updateDistance(o);
		}
		io.emit('speed', currentSpeed, theDistance, _topSpeed, _avgSpeed, stopwatch.ms);

	}).observe({
		frequency : 0,
		interval : 0
	});
	//to kick start the signal processor
});

var autoupdater = new AutoUpdater({
	pathToJson : '',
	autoupdate : false,
	checkgit : false,
	jsonhost : 'raw.githubusercontent.com',
	contenthost : 'codeload.github.com',
	progressDebounce : 0,
	devmode : true
});

// State the events
autoupdater.on('git-clone', function() {
	console.log("You have a clone of the repository. Use 'git pull' to be up-to-date");
});
autoupdater.on('check.up-to-date', function(v) {
	console.info("You have the latest version: " + v);
});
autoupdater.on('check.out-dated', function(v_old, v) {
	console.warn("Your version is outdated. " + v_old + " of " + v);
	autoupdater.fire('download-update');
	// If autoupdate: false, you'll have to do this manually.
	// Maybe ask if the'd like to download the update.
});
autoupdater.on('update.downloaded', function() {
	console.log("Update downloaded and ready for install");
	autoupdater.fire('extract');
	// If autoupdate: false, you'll have to do this manually.
});
autoupdater.on('update.not-installed', function() {
	console.log("The Update was already in your folder! It's read for install");
	autoupdater.fire('extract');
	// If autoupdate: false, you'll have to do this manually.
});
autoupdater.on('update.extracted', function() {
	console.log("Update extracted successfully!");
	console.warn("RESTART THE APP!");
});
autoupdater.on('download.start', function(name) {
	console.log("Starting downloading: " + name);
});
autoupdater.on('download.progress', function(name, perc) {
	process.stdout.write("Downloading " + perc + "%");
});
autoupdater.on('download.end', function(name) {
	console.log("Downloaded " + name);
});
autoupdater.on('download.error', function(err) {
	console.error("Error when downloading: " + err);
});
autoupdater.on('end', function() {
	console.log("The app is ready to function");
});
autoupdater.on('error', function(name, e) {
	console.error(name, e);
});
