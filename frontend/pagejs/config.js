var socket = io();

var version = "";
var ipAddress;
var qrcode;

$(document).ready(function() {
	socket.emit('setup init', " ");
	
	$("#newbutton").click(function(){
		console.log("newbutton pressed.");
		$('#my_popup').popup("show");
	});
	
	$("#cancel").click(function(){
		$('#my_popup').popup("hide");
	});
	
	$("#shutdown").click(function(){
		$('#my_popup').popup("hide");
		$('#shutting_down').popup("show");
		setTimeout(shutItDown,2000);
	});
	
	qrcode = new QRCode("theqr", {
	    text: ipAddress+":8080",
	    width: 128,
	    height: 128,
	    colorDark : "#2e74a5",
	    colorLight : "#ffffff",
	    correctLevel : QRCode.CorrectLevel.H
	});
	
	// Initialize the plugin
    $('#my_popup').popup({
      color: 'white',
      opacity: 1,
      transition: '0.3s',
      scrolllock: true
    });
    
    $('#shutting_down').popup({
      color: 'white',
      opacity: 1,
      transition: '0.3s',
      scrolllock: true
    });
    
    

});

function shutItDown(){
	socket.emit('please shutdown', '');
}


socket.on('init', function( _ipAddress, _version ){
	
	version = _version;
	$("#version").text(version);
	
	ipAddress = _ipAddress;
	$("#ipaddress").text( ipAddress );
	
	//qrcode.clear(); // clear the code.
	qrcode.makeCode( ipAddress+":8080" ); // make another code.
	
	console.log( ipAddress );
	
});