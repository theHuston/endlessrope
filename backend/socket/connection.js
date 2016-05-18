const EventEmitter = require('events').EventEmitter;
const EVENTS = {
    start: "gun shot",
    init: "init",
    finish: "finishline",
    shutdown: "please shutdown",
    prep: "on your mark",
    measure: "speed",
    disconnect: "disconnect",
};
class Connection extends EventEmitter {
    constructor(socket) {
        this.socket = socket;
    }
    update() {
        this.
    }
}
