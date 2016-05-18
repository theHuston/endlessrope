"use strict";
var inherits = require( "util" )
	.inherits;
////////////////////////////////////////////////////////////////////////////////
class Mask
{
	constructor( o )
	{
    if(o instanceof Mask) 
      return o;
		this.o = o;
	}
  set(name,v) {
    this.o[name] = v;
    return this;
  }
  get(name) {
    return this.o[name];
  }
	promiseAll()
	{
		return new Promise( ( s, f ) =>
		{
			var o = {};
			var keys = Object.keys( this.o );
			var pending = keys.length;
			var fail = false;
			this.map( ( p, i ) =>
				p.then( x =>
				{
					o[ i ] = x;
					if ( --pending && !fail )
					{
						s( o )
					}
				} )
				.catch( e =>
				{
					fail = true;
					f( e );
				} ) )
		} )
	}
	filter( f )
	{
		var r = {};
		let o = this.o;
		for ( let i in o )
			if ( f( o[ i ] ,i) ) r[ i ] = o[ i ];
		return new Mask( r );
	}
	filter_reduce( ff, fr, v )
	{
		let o = this.o;
		for ( let i in o )
			if ( ff( o[ i ] ) ) v = fr( v, o[ i ], i, o );
		return v;
	}
	map( f )
	{
		var r = {};
		let o = this.o;
		for ( let i in o ) r[ i ] = f( o[ i ], i, o );
		return new Mask( r );
	}
	map_reduce( fm, fr, v )
	{
		let o = this.o;
		for ( let i in o ) v = fr( v, fm( o[ i ], i, o ), i, o );
		return v;
	}
	forEach( f )
	{
		let o = this.o;
		for ( let i in o ) f( o[ i ], i, o );
	}
  copy() {
    return this.map((x) => x);
  }
  forEachOwn(f) {
    let o     = this.o;
    let keys  = Object.keys(this.o);
    keys.forEach((k) => f(o[k],k,o));
  }
	reduce( f, v )
	{
		let o = this.o;
		for ( let i in o ) v = f( v, o[ i ], i, o );
		return v;
	}
	join( del, pref, posf )
	{
		// merge key value pairs into string
	}
	merge( p )
	{
		var o = this.o
		for ( let k in p )
		{
			o[ k ] = p[ k ];
		}
		return mask( o );
	}
  extend(p) {
    this.o = Object.create(this.o);
    return this.merge(p);
  }
	product( x )
	{
		let o = this.o;
		return mask( x )
			.map( ( f, name ) => f( o[ name ] ) );
	}
	static create( o )
	{
		if ( o instanceof Mask )
		{
			return o;
		}
		return new Mask( o );
	}
}
////////////////////////////////////////////////////////////////////////////////
function lockClass( keep )
{
	this._locked = true;
	if ( keep )
	{

	}
	for ( let k in this.public )
	{
		Object.defineProperty( this.prototype, "_" + k,
		{
			value: this.public[ k ]
		} )
	}
};

function unlockClass()
{
	this._locked = false;
	console.trace( "WARNING CLASS UNLOCKED" );
}

function createClass( base )
{
	var cons = function()
	{
		if ( cons._locked )
		{
			console.trace( "useing unlocked class" );
		}
		base.constructor.call( this, ...arguments );
	};
	inherits( cons, superClass );

	cons.private = options.private;
	for ( let k in options.private )
	{
		Object.defineProperty( cons.prototype, "_" + k,
		{
			value: options.private[ k ]
		} )
	}

	cons.public = options.public;
	cons.prototype = Mask
		.create( cons.prototype )
		.merge( options.public )
		.o;

	cons.prototype.super = options.super;
	cons.prototype.constructor = cons;

	cons = Mask.create( cons )
		.merge( options.static )
		.o;
	cons.lock = lockClass;
	cons.name = options.name;
	return cons;
}
let mask = exports.mask = Mask.create;
exports.Mask = Mask;
exports.createClass = createClass;
