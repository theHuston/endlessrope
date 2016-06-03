var currentSpeed = 0;
var lastSpeed = 0;
var distance = 0;
var lastDistance = 0;
var distanceInterval;
var progressInterval;
var updateInterval;
var speedInterval;
var lapNumber = 0;
var avgSpeed = 0;
var topSpeed = 0;

var MAX_SPEED = 1500;

var time;// = 2000;
// in Milliseconds

var _activity = 'FREECLIMB';

var speed_gauge;

var ready = false;

var messageNote;

var socket = io();

function tryAgain() {
	socket.emit('on your mark', _activity);
}


$(document).ready(function() {
	
	$(".sidebar-nav A").mousedown(function(e) {
		e.preventDefault();
		$(this).click();
	});

	//textFit($('#distance'));
	//textFit($('#theTime'));

	if (document.location.hostname == "localhost") {
		tryAgain();
	}
	
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
	
	
	/*
	speed_gauge = new JustGage({
		id : "speed_gauge",
		value : currentSpeed,
		min : 0,
		max : MAX_SPEED,
		levelColors : ["#2e74a5", "#2e74a5", "#2e74a5", "#2e74a5", "#2e74a5", "#FF0000"],
		relativeGaugeSize : true,
		title : " ",
		valueFontColor : "#5D5D5D",
		startAnimationTime : 0,
		label : "FT/MIN",
		titleFontColor: "#5b5b5b",
        titleFontFamily: "aviano_sansregular",
        titlePosition: "below",
        valueFontColor: "#000000",
        valueFontFamily: "aviano_sansregular"
	});
	
	top_speed_gauge = new JustGage({
		id : "top_speed_gauge",
		value : topSpeed,
		min : 0,
		max : MAX_SPEED,
		levelColors : ["#FFFFFF"],
		relativeGaugeSize : true,
		title : " ",
		valueFontColor : "#5D5D5D",
		hideInnerShadow: true,
        startAnimationTime: 1,
        startAnimationType: "linear",
        refreshAnimationTime: 1,
        refreshAnimationType: "linear",
		label : "",
		hideMinMax : true,
		gaugeWidthScale : 0.01,
		textRenderer: customValue,
		pointer: true,
        pointerOptions: {
          toplength: 6,
          bottomlength: -12,
          bottomwidth: 5,
          color: '#2e74a5'
        }
	}); */

	

	$("#stopReset").mousedown(function() {
		socket.emit('on your mark', _activity);
		showMessage("Freeclimb reset.");
	});
	
	ready = true;
	updateInfo();
	//$('.gauge').val( currentSpeed.toFixed(0) ).trigger('change');
	//speedInterval = setInterval(updateSpeed, 1000);
	//updateInterval = setInterval(updateInfo, 250);
	
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

});

function customValue(val){
	return "";
}

function updateSpeed() {
	
    /*$('#speed_gauge').each(function() {
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
             $(this).val(Math.ceil(this.value)).trigger('change');
          }
       });
   });
   
   lastSpeed = currentSpeed.toFixed(0);*/
   $("#theSpeed").text(currentSpeed.toFixed(0));
   $("#avgSpeed").text(avgSpeed.toFixed(2));
   $("#theTime").text(millisecondsToString(time));
}

function updateInfo() {
	//speed_gauge.refresh(currentSpeed.toFixed(0));
	//top_speed_gauge.refresh(topSpeed.toFixed(0));
	$('#speed_gauge').val( currentSpeed.toFixed(0) ).trigger('change');
    $('#top_speed_gauge').val( topSpeed.toFixed(0) ).trigger('change');
    
   
	$("#distance").text(distance.toFixed(0));
	$("#topSpeed").text(topSpeed.toFixed(2));
}


socket.on('speed', function(_speed, _distance, _topSpeed, _avgSpeed, _time) {

	currentSpeed = _speed;
	distance = _distance;
	topSpeed = _topSpeed;
	avgSpeed = _avgSpeed;
	time = _time;
	
	//updateInfo();
}).on('showMessage', function(_message, _type, _layout, _timeout) {
	showMessage(_message, _type, _layout, _timeout);
});

function showMessage(msg, type, layout, timeout) {
	if ( typeof layout === 'undefined') {
		layout = 'topCenter';
	}
	if ( typeof type === 'undefined') {
		type = 'information';
	}
	if ( typeof timeout === 'undefined') {
		timeout = 3000;
	}
	messageNote = noty({
		layout : layout,
		type : type,
		text : msg,
		timeout : timeout
	});
}

function showMessage( msg, type, layout ){
	if (typeof layout === 'undefined') { layout = 'topCenter'; }
	if (typeof type === 'undefined') { type = 'information'; }
	messageNote = noty({layout: layout, type: type, text: msg, timeout: 3000 });
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
