var currentSpeed = 0;
var distance = 0;
var lastDistance = 0;
var distanceInterval;
var progressInterval;
var lapNumber = 0;
var avgSpeed = 0;
var topSpeed = 0;

var MAX_SPEED = 600;

var time;
// in Milliseconds

var _activity = 'FREECLIMB';

var speed_gauge;

var socket = io();

function tryAgain(){
	socket.emit('on your mark', _activity);
}

$(document).ready(function() {
	
	//textFit($('#distance'));
	//textFit($('#theTime'));
	
	if (document.location.hostname == "localhost"){
		tryAgain();
	}

	var speed_gauge = new JustGage({
		id : "speed_gauge",
		value : currentSpeed,
		min : 0,
		max : MAX_SPEED,
		levelColors : ["#2e74a5", "#6bbcea", "#00FFFF", "#FF0000"],
		relativeGaugeSize: true,
		title : " ",
		valueFontColor : "#5D5D5D",
		startAnimationTime : 0,
		label : "FEET/MINUTE"
	});

	

	distanceInterval = setInterval(function() {

		speed_gauge.refresh(currentSpeed.toFixed(0));
		$("#distance").text(distance.toFixed(0));
		$("#topSpeed").text(topSpeed.toFixed(2));
		$("#avgSpeed").text(avgSpeed.toFixed(2));
		$("#theTime").text( millisecondsToString( time ) );

	}, 50);

	$("#stopReset").click(function() {
		socket.emit('on your mark', _activity);
	});

});


socket.on('speed', function(_speed, _distance, _topSpeed, _avgSpeed, _time) {

	currentSpeed = _speed;
	distance = _distance;
	topSpeed = _topSpeed;
	avgSpeed = _avgSpeed;
	time = _time;

});

function millisecondsToString(milliseconds) {
	var oneHour = 3600000;
	var oneMinute = 60000;
	var oneSecond = 1000;
	var seconds = 0;
	var minutes = 0;
	var hours = 0;
	var result;

	if (milliseconds >= oneHour) {
		hours = Math.floor(milliseconds / oneHour);
	}

	milliseconds = hours > 0 ? (milliseconds - hours * oneHour) : milliseconds;

	if (milliseconds >= oneMinute) {
		minutes = Math.floor(milliseconds / oneMinute);
	}

	milliseconds = minutes > 0 ? (milliseconds - minutes * oneMinute) : milliseconds;

	if (milliseconds >= oneSecond) {
		seconds = Math.floor(milliseconds / oneSecond);
	}

	milliseconds = seconds > 0 ? (milliseconds - seconds * oneSecond) : milliseconds;

	if (hours > 0) {
		result = (hours > 9 ? hours : "0" + hours) + ":";
	} else {
		result = "";
	}

	if (minutes > 0) {
		result += (minutes > 9 ? minutes : "0" + minutes) + ":";
	} else {
		result += "00:";
	}

	if (seconds > 0) {
		result += (seconds > 9 ? seconds : "0" + seconds);
	} else {
		result += "00";
	}

	return result;
}
