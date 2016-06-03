var express = require('express');

var app = express();

var os = require('os');
var exec = require('child_process').exec;

var WiFiControl = require("wifi-control");
var wifiStatus;
var connected = false;
var ip_address = "";

var wirelessList = [];
//var connectedAddress = "";

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
	if(activity == "")
	theDistance = 0;
	//stopTesting();
};

// Get the module
/*
 • Timer will start on pull when the "Finished" Race overview is showing.

 • The reset doesn't reset the distance on the timed climb.

 • The Mileage presets on the distance page climb only work when the timer is running.
 */

var counter = 0;
var currentSpeed = 0;
var _climbingDistance = 330;
var _climbingTime = 10000;

var displayUp = false;

var speedometer = 0;

var message = "";

var REFRESH_SPEED_MS = 1000;

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

WiFiControl.init({
	debug : true,
	connectionTimeout : 20000
});

wifiStatus = WiFiControl.getIfaceState();
if (wifiStatus.connection == 'connected') {
	connected = true;
}

console.log(wifiStatus);

app.use(express.static(__dirname + '/frontend'));
app.get('/', function(req, res) {
	res.sendFile('./index.html');
});

// -- GET IP ADDRESS --
function getLocalIp() {
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

	//console.log(addresses);
	return addresses[0];
}

// -- LOCAL REBOOT --
function rebootTheMachine() {
	console.log("Restarting machine");

	exec("sudo reboot", function(error, stdout, stderr) {
		if (error !== null) {
			console.log("exec errror: " + error);
		}
	});
}

var testTimer;
io.on('connection', function(socket) {
	resetState();
	
	console.log('a user connected');
	wifiStatus = WiFiControl.getIfaceState();
	if (wifiStatus.connection == 'connected') {
		connected = true;
	} else {
		connected = false;
	}
	
	ip_address = getLocalIp();
	io.emit('init', connected, ip_address, wifiStatus.ssid, version);
	

	// -- CHECK FOR UPDATES --
	socket.on('check for updates', function() {
		// Start checking
		console.log("Checking for updates.");
		autoupdater.fire('check');
	});

	// -- WIRELESS --
	socket.on('wireless', function(_function, _option, _option2) {
		if ( typeof _function === 'undefined') {
			_function = "start";
		}

		switch ( _function ) {
		case "start":

			WiFiControl.scanForWiFi(function(err, response) {
				if (err) {
					message = "Wifi Error : " + err;
					console.error(message);
					io.emit('showMessage', message, "error", null);
				}

				io.emit('getWireless', response.networks);

				console.log(response);
			});

			break;
		//case "stop":
		//	wireless.stop();
		//	break;

		case "connect":
			var _ap = {
				ssid : _option.toString(),
				password : _option2.toString()
			};
			var results = WiFiControl.connectToAP(_ap, function(err, response) {
				if (err) {
					message = "Exec Error : " + err;
					console.error(message);
					io.emit('connectedWifiFail', err );
				} else {
					console.log("Chris "+response[0]+response[1]);
					connected = true;
					var ip_address = getLocalIp();
					io.emit('connectedWifiSuccess', ip_address);
				}
				
				
			});

			break;

		default:
		}
	});

	// -- USER DISCONNECT --
	socket.on('disconnect', function() {
		resetState();
		console.log('user disconnected');

	});

	//-- USER FINISHLINE --
	socket.on('finishline', function(player) {
		console.log("finishline event");
		finishLine(player);
	});

	// -- SHUTDOWN --
	socket.on('please shutdown', function(msg) {
		console.log("Closing");

		exec("sudo poweroff", function(error, stdout, stderr) {
			if (error !== null) {
				message = "Exec Error : " + error;
				console.error(message);
				io.emit('showMessage', message, "error", null);

			}
		});
	});

	// -- REBOOT --
	socket.on('please reboot', function(msg) {
		rebootTheMachine();
	});
	
	socket.on('start update', function(){
		autoupdater.fire('download-update');
	});

	// -- ON YOUR MARKS --
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
		_isStarted = false;
	}
	
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
			theDistance = theDistance;
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

// -- START WEB BROWSER --
http.listen(8080, function() {
	console.log('listening on *:8080');

	/*
	 //exec("DISPLAY=:0 kweb -KJHB 'http://localhost:8080'", function(error, stdout, stderr) {
	 //exec("DISPLAY=:0 chromium-browser --disable-pinch --kiosk --enable-kiosk-mode --enabled --touch-events --touch-events-ui --disable-ipv6 --allow-file-access-from-files --disable-java --disable-restore-session-state --disable-sync --disable-translate --disk-cache-size=1 --media-cache-size=1 http://localhost:8080", function(error, stdout, stderr) {
	 exec("DISPLAY=:0 chromium-browser  --touch-events --disable-touch-drag-drop --disable-restore-session-state --incognito  --kiosk --start-maximized http://localhost:8080", function(error, stdout, stderr) {
	 console.log("stdout: " + stdout);
	 console.log("stderr: " + stderr);
	 displayUp = true;
	 if (error !== null) {
	 console.log("exec errror: " + error);
	 }
	 }); */

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
		message = "SENSOR ERROR:", err;
		console.log(message);
		io.emit('showMessage', message, "error", null);
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
	message = "You have the latest version: " + v;
	console.info(message);
	io.emit('showMessage', message, "success", "topCenter", 5000);
});
autoupdater.on('check.out-dated', function(v_old, v) {
	message = "<strong>Your version is outdated.</strong> <br>" + v_old + " of " + v;
	console.warn(message);
	io.emit('updateNeeded', message );
	//io.emit('showMessage', message, "warning", "topCenter", null);
	//autoupdater.fire('download-update');
	// If autoupdate: false, you'll have to do this manually.
	// Maybe ask if the'd like to download the update.
});
autoupdater.on('update.downloaded', function() {
	message = "Update downloaded and ready for install";
	console.log(message);
	//io.emit('showMessage', message,"alert" );
	autoupdater.fire('extract');
	// If autoupdate: false, you'll have to do this manually.
});
autoupdater.on('update.not-installed', function() {
	message = "The Update was already in your folder! It's read for install";
	console.log(message);
	io.emit('showMessage', message);
	autoupdater.fire('extract');
	// If autoupdate: false, you'll have to do this manually.
});
autoupdater.on('update.extracted', function() {
	message = "Update Complete.<br><h3>Restarting</h3>";
	//io.emit('showMessage', message, "success" );
	console.log(message);
	console.warn("RESTART THE MACHINE!");
	io.emit('showMessage', message, "success", null);
	setTimeout(rebootTheMachine, 2000);
});
autoupdater.on('download.start', function(name) {
	message = "Starting downloading: " + name;
	console.log(message);
	//io.emit('showMessage', message, "alert", 12000 );
});
autoupdater.on('download.progress', function(name, perc) {
	//process.stdout.write("Downloading " + perc + "%");
});
autoupdater.on('download.end', function(name) {
	message = "Downloaded " + name;
	console.log(message);
	io.emit('showMessage', message, "alert" );
});
autoupdater.on('download.error', function(err) {
	message = "Error when downloading: " + err;
	console.error(message);
	io.emit('showMessage', message, "error", null);
});
autoupdater.on('end', function() {
	message = "Update Complete.";
	console.log(message);
	//io.emit('showMessage', message );
});
autoupdater.on('error', function(name, e) {
	message = name + " : " + e;
	console.error(name, e);
	io.emit('showMessage', message, "error", null);
});
