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
	showMessage("<h2>GO!</h2>","success", "topCenter", 500);
});

function tryAgain() {
	socket.emit('on your mark', _activity, defaultTime);
	lastDistance = 0;
}


$(document).ready(function() {
	
	$("#reveal").addClass("loaded");
	
	$(".sidebar-nav A").mousedown(function(e) {
		e.preventDefault();
		$("#wrapper").removeClass("toggled");
		$("#reveal").removeClass("loaded");
		
		switch ( this.id ) {
		case "freerunButt":
			setTimeout(function(){ window.location.href = "/index.html"; },500);
			break;
		case "timedButt":
			setTimeout(function(){ window.location.href = "/timed.html"; },500);
			break;

		case "distanceButt":
			setTimeout(function(){ window.location.href = "/laps.html"; },500);
			break;
			
		case "configButt":
			setTimeout(function(){ window.location.href = "/config.html"; },500);
			break;

		default:
		}
		
	});

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
	
	$("#speed_gauge").knob({
	    'min':0,
	    'max':1500,
	    'angleArc':180,
	    'angleOffset':-90,
	    'width':360,
	    'readOnly': true,
	    'fgColor':'#006a9b',
		'bgColor':'transparent',
	    'inputColor':'#000', 
	    'font':'aviano_sansregular',
	    'displayInput':false,
	    'dynamicDraw': true
	}); 
	
	$("#top_speed_gauge").knob({
	    'min':0,
	    'max':1500,
	    'angleArc':180,
	    'angleOffset':-90,
	    'width':360,

	    'readOnly': true,
	    'fgColor':'#DDDDDD',
		'bgColor':'#FFFFFF',
	    'inputColor':'#000', 
	    'font':'aviano_sansregular',
	    'displayInput':false,
	    'dynamicDraw': true
	}); 
	
	$('#2min').mousedown(function() {
		defaultTime = 120000;
		$("#dropTime").html("2 Min");
		tryAgain();
	});
	
	$('#5min').click(function() {
		defaultTime = 300000;
		$("#dropTime").html("5 Min");
		tryAgain();
	});
	
	$('#10min').mousedown(function() {
		defaultTime = 600000;
		$("#dropTime").html("10 Min");
		tryAgain();
	});
	
	$('#20min').mousedown(function() {
		defaultTime = 1200000;
		$("#dropTime").html("20 Min");
		tryAgain();
	});
	
	$('#1hour').mousedown(function() {
		defaultTime = 3599999;
		$("#dropTime").html("1 Hour");
		tryAgain();
	});

	$('#stopReset').mousedown(function() {
		tryAgain();
		showMessage("Timer Reset","information");
	});

	$('#lessTime').repeatedclick(function() {
		if( defaultTime > 10000 ){
			defaultTime -= 10000;
			tryAgain();
		}
	});

	$('#moreTime').repeatedclick(function() {
		defaultTime += 10000;
		tryAgain();
	});
	
	$("#cancel").mousedown(function(){
		$('#my_popup').popup("hide");
		tryAgain();
		showMessage("Timer Reset","information");
	});
	
	// setTimeout Example
	(function loopingFunction() {
	    updateInfo();
	    setTimeout(loopingFunction, 50);
	})();
	
	// setTimeout Example
	(function loopingFunction2() {
	    updateSpeed();
	    setTimeout(loopingFunction2, 1000);
	})();
	
	//updateInfo();
	//$('.gauge').val( currentSpeed.toFixed(0) ).trigger('change');
	//speedInterval = setInterval(updateSpeed, 1000);

});

function updateSpeed() {
	
    $("#theSpeed").text(currentSpeed.toFixed(0));
    $("#avgSpeed").text(avgSpeed.toFixed(2));
	$("#theTime").text(millisecondsToString(time));
}

function updateInfo() {
	$('#speed_gauge').val( currentSpeed.toFixed(0) ).trigger('change');
    $('#top_speed_gauge').val( topSpeed.toFixed(0) ).trigger('change');
    
	$("#topSpeed").text(topSpeed.toFixed(2));
	$("#distance").text(distance.toFixed(1));

}


socket.on('speed', function(_speed, _distance, _topSpeed, _avgSpeed, _time) {

	currentSpeed = _speed;
	distance = _distance;
	topSpeed = _topSpeed;
	avgSpeed = _avgSpeed;
	time = _time;

	//updateInfo();

}).on('finishline', function() {
	finished = true;
	$("#timeTable #total_time").text(millisecondsToString(defaultTime));
	$("#timeTable #total_distance").text(distance.toFixed(2));
	$("#timeTable #top_speed").text(topSpeed.toFixed(2));
	$("#timeTable #avg_speed").text(avgSpeed.toFixed(2));
	$('#my_popup').popup("show");
}).on('showMessage', function(_message, _type, _layout, _timeout) {
	showMessage(_message, _type, _layout, _timeout);
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
