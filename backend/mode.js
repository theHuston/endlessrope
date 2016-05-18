"use strict";
const EventEmitter  = require( 'events' ).EventEmitter;
const modes         = {};

class Mode extends EventEmitter
{
	constructor( name, init, end, session )
	{
		super();
		this.name     = name;
		this._init    = init;
		this._end     = end;

		modes[ name ] = this;
	}
	start()
	{
		return this._init( ...arguments );
	}
	stop()
	{
		return this._end( ...arguments );
	}
	static create( name, init, end )
	{
		return new Mode( name, init, end );
	}
}
module.exports = {
    Mode:Mode,
    modes:modes,
}
/*
case "FREECLIMB":
	stopwatch = new Stopwatch();
	break;
case "TIMEDCLIMB":
	_climbingTime = option;
	stopwatch = new Stopwatch( _climbingTime );
	stopwatch.on( 'done', function()
	{
		console.log( 'Timer is complete' );
		io.emit( 'finishline' );
	} );
	break;
case "DISTANCECLIMB":
	stopwatch = new Stopwatch();
	_climbingDistance = option;
	break;
default:
	//nothing
*/
