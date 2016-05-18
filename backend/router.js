const exec = require('child_process').exec;
module.exports = require('express')
    .use(express.static(__dirname + '/public'))
    .get('/', function(req, res) {
        res.sendFile('index.html');
    })
    .listen(8080, function() {
        console.log('listening on *:8080');

        exec("DISPLAY=:0 chromium-browser  "                +
                "--touch-events "                           +
                "--ignore-certificate-errors "              +
                "--disable-touch-drag-drop "                +
                "--disable-restore-session-state "          +
                "--incognito  "                             +
                "--kiosk "                                  +
                "--start-maximized http://localhost:8080"   , 
            function(error, stdout, stderr) {
                console.log("stdout: " + stdout);
                console.log("stderr: " + stderr);
                displayUp = true;
                if (error !== null) {
                    console.log("exec errror: " + error);
                }
            });

    });
