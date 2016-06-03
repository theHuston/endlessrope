var socket = io();

var version = "";
var ipAddress;
var ssid;
var qrcode;
var updating = false;

var start;
var maxTime = 3000;
var timeoutVal;
var connected = false;

var progressNote;
var shutdownNote;
var connectionNote;
var connectingNote;
var connectingProgress;

var wirelessNetwork;

var wirelessList = [];
var wirelessListButton = $("#wirelessListButton");

$(document).ready(function() {
	//socket.emit('setup init', " ");
	
	$(".sidebar-nav A").mousedown(function(e) {
		e.preventDefault();
		$(this).click();
	});
	 

	$("#newbutton").mousedown(function() {
		shutDownConfirm();
	});

	$("#updateCheck").mousedown(function() {
		showMessage("Checking for Updates", "alert", "topCenter", 1000 );
		socket.emit('check for updates', '');
	});

	$("#wifiCheck").mousedown(function() {
		progressReport();
		socket.emit('wireless', 'start');
	});

	$("#cancel").mousedown(function() {
		//$('#my_popup').popup("hide");
	});

	$("#shutdown").mousedown(function() {
		//$('#my_popup').popup("hide");
		//$('#shutting_down').popup("show");
		//setTimeout(shutItDown, 2000);
	});
	/*
	qrcode = new QRCode("theqr", {
	text: ipAddress+":8080",
	width: 128,
	height: 128,
	colorDark : "#2e74a5",
	colorLight : "#ffffff",
	correctLevel : QRCode.CorrectLevel.H
	}); */

	// Initialize the plugin
	/*$('#my_popup').popup({
	 color : 'white',
	 opacity : 1,
	 transition : '0.3s',
	 scrolllock : true
	 });

	 $('#shutting_down').popup({
	 color : 'white',
	 opacity : 1,
	 transition : '0.3s',
	 scrolllock : true
	 });

	 */

});

function connectToNetwork(_index) {

	wirelessNetwork = wirelessList[_index];

	connectionNote = noty({
		text : '<h4>Connect to ' + wirelessNetwork.ssid + '?</h4>',
		modal : true,
		layout : "center",
		buttons : [{
			addClass : 'btn btn-success',
			text : 'CONNECT',
			onClick : function($noty) {

				// this = button element
				// $noty = $noty element

				$noty.close();
				noty({
					text : '<h4>Password for ' + wirelessNetwork.ssid + '</h4><form class="form-inline"><div class="form-group"><label class="sr-only" for="password">Password</label><input type="text" style="font-family:Arial; font-size:18px;" class="form-control" id="password" placeholder="Password"></div></form>',
					type : 'alert',
					layout : 'topCenter',
					closeWith : null,
					modal : true,
					buttons : [{
						addClass : 'btn btn-success',
						text : 'CONNECT',
						onClick : function($noty) {
			
							// this = button element
							// $noty = $noty element
							attemptConnection( $("#password").val() );
							$noty.close();
						}
					}, {
						addClass : 'btn btn-primary',
						text : 'Cancel',
						onClick : function($noty) {
							$noty.close();
						}
					}]
				});
						
				$('#password').keyboard({
					layout : 'qwerty',
					checkCaret : true,
					useWheel : false,
					usePreview : false,
					autoAccept : true,
					beforeVisible : function(e, keyboard) {
						setTimeout(function() {
							keyboard.saveCaret();
						}, 200);
					},
					css : {
						// input & preview
						//input: 'form-control input-sm',
						caretToEnd : true,
						// keyboard container
						container : 'center-block dropdown-menu', // jumbotron
						// default state
						buttonDefault : 'btn btn-default',
						// hovered button
						buttonHover : 'btn-primary',
						// Action keys (e.g. Accept, Cancel, Tab, etc);
						// this replaces "actionClass" option
						buttonAction : 'active',
						// used when disabling the decimal button {dec}
						// when a decimal exists in the input area
						buttonDisabled : 'disabled'
					}
				}).getkeyboard().reveal();
			}
		}, {
			addClass : 'btn btn-primary',
			text : 'Cancel',
			onClick : function($noty) {
				$noty.close();
			}
		}]
	});
}

function attemptConnection( _password ){
	
	connectingNote = noty({
		text : '<h4>Connecting to '+wirelessNetwork.ssid+'</h4>',
		modal : true,
		layout : "center",
		timeout : null
	});
	
	connectingProgress = noty({
		text : "<div class='progress'><div id='waitingBar' class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='100' aria-valuemin='0' aria-valuemax='100' style='width: 100%'><span class='sr-only'>Connecting</span></div></div>",
		layout : "center",
		type : "alert",
		modal : true,
		timeout : null
	});
	
	socket.emit('wireless', 'connect', wirelessNetwork.ssid, _password );
}

function shutDownConfirm() {

	shutdownNote = noty({
		text : '<h4>Would you like to shutdown?</h4>',
		modal : true,
		layout : "center",
		buttons : [{
			addClass : 'btn btn-danger',
			text : 'Shutdown',
			onClick : function($noty) {

				// this = button element
				// $noty = $noty element

				setTimeout(shutItDown, 2000);

				$noty.close();
				noty({
					text : '<h3>Shutting down now.</h3>',
					type : 'alert',
					layout : 'center',
					modal : true
				});
			}
		}, {
			addClass : 'btn btn-primary',
			text : 'Cancel',
			onClick : function($noty) {
				$noty.close();
			}
		}]
	});
}

function shutItDown() {
	socket.emit('please shutdown', '');
}

function setConnectionStatus( _connected ){
	connected = _connected;

	if (connected) {
		$("#status").text("Connected");
		$("#wifiStatus").addClass("alert-success");
	} else {
		$("#status").text("Not Connected");
		$("#wifiStatus").addClass("alert-warning");
	}
}


socket.on('init', function(_connected, _ipAddress, _ssid, _version) {

	setConnectionStatus( _connected );

	version = _version;
	$("#version").text(version);

	ipAddress = _ipAddress;
	$("#ipAddress").text(ipAddress);
	
	ssid = _ssid;
	$("#ssid").text( ssid );

	//qrcode.makeCode( ipAddress+":8080" ); // make another code.

	console.log(ipAddress);

}).on('showMessage', function(_message, _type, _layout, _timeout) {
	showMessage(_message, _type, _layout, _timeout);
}).on('getWireless', function(_wirelessList) {
	console.log("I got the LIST.");
	
	wirelessList = [];

	$.each(_wirelessList, function() {
		wirelessList.push(this);
	});
	
	message = "Found "+wirelessList.length+" wifi networks";
	console.log(wirelessList.length);
	showMessage(message, "success", "center", 2000 );

	//-- SORT BY QUALITY --
	wirelessList.sort(function(a, b) {
		return parseFloat(b.signal_level) - parseFloat(a.signal_level);
	});

	buildWirelessList(wirelessList);

}).on('connectedWifiSuccess', function( _ip_address ){
	
	ipAddress = _ip_address;
	$("#ipaddress").text(_ip_address);
	setConnectionStatus( true );
	showMessage("<h3>CONNECTED</h3>", "success", "center", 2000 );
	connectingProgress.close();
	connectingNote.close();
	
}).on('connectedWifiFail', function( error ){
	
	message = "<strong>Connection Failed</strong><br>"+error;
	console.log(message);
	showMessage(message, "warning", "center", 8000 );
	connectingProgress.close();
	connectingNote.close();
	
});

function buildWirelessList(_wirelessList) {
	var iconWidth;

	wirelessList = _wirelessList;

	wirelessListButton.empty();
	
	$.each(wirelessList, function() {
		//console.log("got one");
		//var theHtml = "<li>"
		wirelessListButton.append($("<li />").append($("<a />").attr("href", "#").attr("type", "button").attr("draggable", "false").addClass("wifiNetwork").text(" (" + this.signal_level + "%) " + this.ssid).prepend($("<div />").addClass("pull-left icon-mask ").append($("<span />").addClass("glyphicon glyphicon-signal").width(this.signal_level + "%")))));

		console.log(this);

	});

	$(".wifiNetwork").click(function() {
		connectToNetwork($('.wifiNetwork').index(this));
	});
}

function progressReport() {
	
	showMessage("<h4>Scanning Wifi</h4>", "alert", "center", maxTime );
	
	progressNote = noty({
		text : "<div class='progress'><div id='theprogressbar' class='progress-bar progress-bar-striped active' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 0%'><span class='sr-only'>0% Complete</span></div></div>",
		layout : "center",
		type : "alert",
		modal : true,
		timeout : null
	});
	start = new Date();
	timeoutVal = Math.floor(maxTime / 100);
	animateUpdate();
}

function updateProgress(percentage) {
	$('#theprogressbar').attr('aria-valuenow', percentage).css('width', percentage);
}

function animateUpdate() {
	var now = new Date();
	var timeDiff = now.getTime() - start.getTime();
	var perc = Math.round((timeDiff / maxTime) * 100);
	if (perc <= 100) {
		updateProgress(perc + "%");
		setTimeout(animateUpdate, timeoutVal);
	} else {
		progressNote.close();
		socket.emit('wireless', 'stop');
	}
}

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