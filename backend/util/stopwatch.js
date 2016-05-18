'use strict';

const EventEmitter = require('events').EventEmitter;

const STATUS = {
    STOPPED   : 0,
    RUNNING   : 1,
    COMPLETE  : 2,
};
const MODE = {
    LIMIT : 0,
    COUNT : 1
};

class StopWatch extends EventEmitter
{
    constructor()
    {
        super();
        this._tick      = null;
        this._status    = false;
        this._mode      = false;
        this._interval  = 0;
        this.time = 
        {
            start   : 0,
            stop    : 0,
            elapsed : 0,
            limit   : 0
        };
    }
    
    get state()   { return this._status;  }
    get mode()    { return this._mode;    }
    get interval(){ return this._interval; }
    get running() { return this._status === STATUS.RUNNING;  }
    get stopped() { return this._status === STATUS.STOPPED;  }
    get complete(){ return this._status === STATUS.COMPLETE; }
    
    reset()
    {
        this.time.start = this.time.stop = this.time.elapsed = this.time.limit = 0;
        if( this._tick ) clearInterval( this._tick );
        this.emit('reset');
    }
    
    start( limit )
    {
        this.time.start = Date.now();
        
        if( limit )
        {
            this._mode      = MODE.LIMIT;
            this.time.limit = limit;
        }
        
        this._status = STATUS.RUNNING;
        this._tick   = setInterval( ()=>(this.update()), this._interval );
        this.update();
        
        this.emit('start');
    }
    stop()
    {
        if( this.running )
        {
            this._status = STATUS.STOPPED;
            if( this._tick ) clearInterval( this._tick );
            this.emit('stop');
        }
    }
    
    update()
    {
        this.time.elapsed = Date.now() - this.time.start;
        if( this.time.elapsed >= this.time.limit )
        {
            if( this._tick ) clearInterval( this._tick );
            this.emit('complete');
        }
    }
}
module.exports = StopWatch;