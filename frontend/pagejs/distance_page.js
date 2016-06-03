var currentSpeed = 0;
var lastSpeed = 0;
var mainDistance = 330;
var minDistance = 10;
var distance = mainDistance;
var lastDistance = 0;
var distanceInterval;
var progressInterval;
var speedInterval;
var lapNumber = 0;
var running = false;
defaultTime = 20000;
var finished = false;
var MAX_SPEED = 600;
var _activity = 'DISTANCECLIMB';

var runner;
var speed_gauge;

var topSpeed = 0;
var avgSpeed = 0;
var time = 20000;

var socket = io();


function tryAgain(){
	distance = mainDistance;
	finished = false;
	running = false;
	socket.emit('on your mark', _activity, mainDistance );
	
};


$(document).ready(function() {
	
	$(".sidebar-nav A").mousedown(function(e) {
		e.preventDefault();
		$(this).click();
	});
	
	// Initialize the plugin
	$('#my_popup').popup({
		color : 'white',
		opacity : 1,
		transition : '0.3s',
		scrolllock : true
	});
	
	if (document.location.hostname == "localhost"){
		tryAgain();
	}
	
	
	/*speed_gauge = new JustGage({
		id : "speed_gauge",
		value : currentSpeed,
		min : 0,
		max : MAX_SPEED,
		relativeGaugeSize: true,
		title : " ",
		levelColors: [
          "#2e74a5",
          "#6bbcea",
          "#FF0000"
        ],
		valueFontColor: "#5D5D5D",
		startAnimationTime: 0,
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

	$('#sixteenMile').mousedown(function() {
		mainDistance = 330;
		$("#dropDistance").html("1/16 Mile");
		tryAgain();
	});
	
	$('#eightMile').mousedown(function() {
		mainDistance = 660;
		$("#dropDistance").html("1/8 Mile");
		tryAgain();
	});
	
	$('#quarterMile').mousedown(function() {
		mainDistance = 1320;
		$("#dropDistance").html("1/4 Mile");
		tryAgain();
	});
	
	$('#halfMile').mousedown(function() {
		mainDistance = 2640;
		$("#dropDistance").html("1/2 Mile");
		tryAgain();
	});
	
	$('#oneMile').mousedown(function() {
		mainDistance = 5280;
		$("#dropDistance").html("1 Mile");
		tryAgain();
	});
	

	$('#stopReset').mousedown(function() {
		tryAgain();
		showMessage("Timer Reset","information");
	});

	
	$('#lessDist').repeatedclick(function() {
		if( mainDistance > (minDistance+1)){
			mainDistance -= 10;
		}
		tryAgain();
	});
	
	$('#moreDist').repeatedclick(function() {
		mainDistance += 10;
		tryAgain();
	});
	
	$("#cancel").mousedown(function(){
		tryAgain();
		$('#my_popup').popup("hide");
		
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
	    setTimeout(loopingFunction2, 750);
	})();
	
	//$('.gauge').val( currentSpeed.toFixed(0) ).trigger('change');
	//speedInterval = setInterval(updateSpeed, 1000);
});

// TAKE OFF
socket.on('gun shot', function( ){
	running = true;
	showMessage("<h2>GO!</h2>","success", "topCenter", 500);
});


socket.on('speed', function( _speed, _distance, _topSpeed, _avgSpeed, _time ){
	
    currentSpeed = _speed;
    topSpeed = _topSpeed;
    avgSpeed = _avgSpeed;
    time = _time;
    distance = _distance;
	
	if( finished == false ){
		if( running ){
			if( distance.toFixed(0) <= 0 ){
				finishLine();
				finished = true;
				running = false;
				distance = 0;
			}
		}
	}
	//updateInfo();
}).on('showMessage', function(_message, _type, _layout, _timeout) {
	showMessage(_message, _type, _layout, _timeout);
}); 

function finishLine(){
	
	socket.emit('finishline' );
	$("#timeTable #total_time").text(msToTime(time));
	$("#timeTable #total_distance").text(mainDistance.toFixed(2));
	$("#timeTable #top_speed").text(topSpeed.toFixed(2));
	$("#timeTable #avg_speed").text(avgSpeed.toFixed(2));
	$('#my_popup').popup("show");
}

function updateSpeed() {
	
    $("#theSpeed").text(currentSpeed.toFixed(0));
    $("#avgSpeed").text(avgSpeed.toFixed(2));
	$("#theTime").text(millisecondsToString(time));
}

function updateInfo(){
	$('#speed_gauge').val( currentSpeed.toFixed(0) ).trigger('change');
    $('#top_speed_gauge').val( topSpeed.toFixed(0) ).trigger('change');
    
	$("#distance").text(distance.toFixed(0));
	$("#topSpeed").text(topSpeed.toFixed(2));
}

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

function msToTime(s) {

  function addZ(n) {
    return (n<10? '0':'') + n;
  }

  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;
  var hrs = (s - mins) / 60;

  return addZ(hrs) + ':' + addZ(mins) + ':' + addZ(secs) + '.' + ms;
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
