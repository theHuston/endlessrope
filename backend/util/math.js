"use strict";

function mavg()
{
	let f = function()
	{
		[ ...arguments ].forEach(
			( i ) => ( f.count++, f.value = ( ( ( f.value * ( f.count - 1 ) ) + i ) / ( f.count ) ) )
		);
		return f;
	};

	f.value = 0;
	f.count = 0;

	return f( ...arguments );
}

module.exports =
{
    mavg : mavg
};