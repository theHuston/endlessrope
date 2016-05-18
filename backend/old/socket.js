const os      = require('os')                                   ;
const io      = require('socket.io')(require("./router.js"))    ;
const race    = require("./race.js")                            ;

// They started pulling
function theyStarted(){

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
let interfaces = os.networkInterfaces();
let addresses = [];
for (let k in interfaces) {
	for (let k2 in interfaces[k]) {
		let address = interfaces[k][k2];
		if (address.family === 'IPv4' && !address.internal) {
			addresses.push(address.address);
		}
	}
}
function shutDown(msg) {
    console.log("Closing");

    exec("sudo poweroff", function(error, stdout, stderr) {
        if (error !== null) {
            console.log("exec errror: " + error);
        }
    });
}
io.on('connection', function(socket) {
	console.log('a user connected');

	io.emit('init', addresses[0]);

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});

	socket.on('finishline', race.finish.bind(race));

	socket.on('please shutdown', shutDown);

	socket.on('on your mark', race.start.bind(race));

});
