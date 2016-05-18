var currentSpeed = 0;
var lastSpeed = 0;
var distance = 0;
var lastDistance = 0;
var avgSpeed = 0;
var topSpeed = 0;
var distanceInterval;
var progressInterval;
var speedInterval;
var lapNumber = 0;
defaultTime = 120000;
var finished = true;
var time;
var MAX_SPEED = 600;

var socket = io();
var _activity = "TIMEDCLIMB";

var runner;
var speed_gauge;

// TAKE OFF
socket.on('gun shot', function(_speed, _distance) {
	finished = false;
	showMessage("Timer Started","success");
});

function tryAgain() {
	socket.emit('on your mark', _activity, defaultTime);
	lastDistance = 0;
}


$(document).ready(function() {

	// Initialize the plugin
	$('#my_popup').popup({
		color : 'white',
		opacity : 1,
		transition : '0.3s',
		scrolllock : true
	});

	if (document.location.hostname == "localhost") {
		tryAgain();
		console.log("<-- localhost -->");
	}

	/*speed_gauge = new JustGage({
		id : "speed_gauge",
		value : currentSpeed,
		levelColors : ["#2e74a5", "#6bbcea", "#FF0000"],
		min : 0,
		max : MAX_SPEED,
		relativeGaugeSize : true,
		title : " ",
		valueFontColor : "#5D5D5D",
		startAnimationTime : 0,
		label : "FEET/MINUTE"
	});*/
	
	$(".gauge").knob({
	    'min':0,
	    'max':1500,
	    'angleArc':180,
	    'angleOffset':-90,
	    'width':330,
	    'readOnly': true,
	    'fgColor':'#006a9b',
		'bgColor':'#FFF',
	    'inputColor':'#000',
	    'dynamicDraw': true, 
	    'font':'aviano_sansregular',
	    'displayInput':true
	});

	$('#stopReset').click(function() {
		tryAgain();
		showMessage("Timer Reset","information");
	});

	$('#lessTime').click(function() {
		defaultTime -= 10000;
		tryAgain();

	});

	$('#moreTime').click(function() {
		defaultTime += 10000;
		tryAgain();

	});
	
	$("#cancel").click(function(){
		$('#my_popup').popup("hide");
		tryAgain();
		showMessage("Timer Reset","information");
	});
	
	// setTimeout Example
	(function loopingFunction() {
	    updateInfo();
	    setTimeout(loopingFunction, 250);
	})();
	//updateInfo();
	//$('.gauge').val( currentSpeed.toFixed(0) ).trigger('change');
	//speedInterval = setInterval(updateSpeed, 1000);

});

function updateSpeed() {
	
    $('.gauge').each(function() {
       var $this = $(this);
       var myVal = $this.attr("rel");
       $this.knob({
       });
       $({
          value: lastSpeed
       }).animate({
          value: currentSpeed.toFixed(0)
       }, {
          duration: 1000,
          easing: 'linear',
          step: function() {
             $this.val(Math.ceil(this.value)).trigger('change');
          }
       });
   });
   
   lastSpeed = currentSpeed.toFixed(0);
}

function updateInfo() {
	$('.gauge').val( currentSpeed.toFixed(0) ).trigger('change');
	$("#topSpeed").text(topSpeed.toFixed(2));
	$("#avgSpeed").text(avgSpeed.toFixed(2));
	$("#distance").text(distance.toFixed(2));
	$("#theTime").text(millisecondsToString(time));
}


socket.on('speed', function(_speed, _distance, _topSpeed, _avgSpeed, _time) {

	currentSpeed = _speed;
	distance = _distance;
	topSpeed = _topSpeed;
	avgSpeed = _avgSpeed;
	time = _time;

	//updateInfo();

});

socket.on('finishline', function() {
	finished = true;
	$("#timeTable #total_time").text(millisecondsToString(defaultTime));
	$("#timeTable #total_distance").text(distance.toFixed(2));
	$("#timeTable #top_speed").text(topSpeed.toFixed(2));
	$("#timeTable #avg_speed").text(avgSpeed.toFixed(2));
	$('#my_popup').popup("show");
});

function showMessage(msg, type, layout) {
	if ( typeof layout === 'undefined') {
		layout = 'topCenter';
	}
	if ( typeof type === 'undefined') {
		type = 'information';
	}
	messageNote = noty({
		layout : layout,
		type : type,
		text : msg,
		timeout : 3000
	});
}

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
