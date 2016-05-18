"use strict";
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
function curry( f, n, a )
{
	a = a || [];
	if ( a.length >= ( n || f.length ) )
	{
		return f( ...a );
	}

	function curry_continue()
	{
		return curry( f, n, [ ...a, ...arguments ] );
	}
	curry_continue.f = f;
	curry_continue.n = n;
	curry_continue.a = a;
	return curry_continue;
}
////////////////////////////////////////////////////////////////////////////////
function defer( f, a, n )
{
	a = a || [];
	n = n || f.length;
	let l = a.length;
	return function()
	{
		if ( l >= n )
		{
			return f( ...a );
		}
		return defer( f, [ ...a, ...arguments ], n );
	};
}
////////////////////////////////////////////////////////////////////////////////
function bind( object, method )
{
    return function bind_call()
    {
        return method.call(object,...arguments);
    };
}
//bind(obj,obj.func)(...p) === obj.func(...p)
////////////////////////////////////////////////////////////////////////////////
function partial( f )
{
    return function partial_args()
    {
        let a = arguments;
        return function partial_call()
        {
            return f(...a,...arguments);
        };
    };
}
// partial(func)(...pa)(...pb) === func(...pa,...pb)
////////////////////////////////////////////////////////////////////////////////
function post_partial( f )
{
    return function post_partial_args( f )
    {
        let a = arguments;
        return function post_partial_call()
        {
            return f(...arguments,...a);
        };
    };
}
// post_partial(func)(...pa)(...pb) === func(...pb,...pa)
////////////////////////////////////////////////////////////////////////////////

/*
var x = curry(function(a,b,c) {
    console.log(a,b,c);
});
var y = x("a","b");
var z = y("c");
var u = y("C");
var v = x("A","B");
var w = v("C");
var a = v("wierd");
*/
////////////////////////////////////////////////////////////////////////////////
function conditional( cond, success, fail, x )
{
	/*if (!is.function(g) || is.undefined(x)) {
	    g = (x) => x;
	}*/
	return cond( x ) ? success( x ) : fail( x );
}
////////////////////////////////////////////////////////////////////////////////
function typeOf( s, x )
{
	return typeof x === s;
}
////////////////////////////////////////////////////////////////////////////////
function instanceOf( x, t )
{
	return x instanceof t;
}
////////////////////////////////////////////////////////////////////////////////
function isObject( x )
{
	return typeOf( x, "function" ) && x !== null;
}
////////////////////////////////////////////////////////////////////////////////
function isNull( x )
{
	return x === null;
}
////////////////////////////////////////////////////////////////////////////////
function isArray( a )
{
	return Array.isArray( a );
}
////////////////////////////////////////////////////////////////////////////////
var is = {
	null       : isNull,
	object     : isObject,
	array      : isArray,
	typeof     : curry( typeOf ),
	undefined  : curry( typeOf )( "undefined" ),
	string     : curry( typeOf )( "string" ),
	instanceof : curry( instanceOf ),
	function   : curry( typeOf )( "function" ),
};
////////////////////////////////////////////////////////////////////////////////
var maybe = function( x, f, g )
{
	return conditional( ((x)=>( (x !== null) && !is.undefined( x )) ), f, g || (()=>(null)), x );
};
////////////////////////////////////////////////////////////////////////////////
is.maybe = require( "./object.js" )
	.mask( is )
	.map( c => function( a, f, g )
	{
		if( c( a ) ) return f( a );
		return is.function( g ) ? g( a ) : ( a ) => a;
	} )
	.o;
////////////////////////////////////////////////////////////////////////////////
function either( x, a, b )
{
	return x ? a : b;
}
////////////////////////////////////////////////////////////////////////////////
function compose( a, b )
{
	return ( c ) => ( a( b( c ) ) );
}
////////////////////////////////////////////////////////////////////////////////
module.exports = {
	maybe          : maybe,
	either         : either,
	is             : is,
	compose        : compose,
	cond           : conditional,
  curry          : curry,
  bind           : curry( bind ),
  partial        : partial,
  post_partial   : post_partial,
};
