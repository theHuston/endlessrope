'use strict';

function nanosecond( start )
{
	let diff = process.hrtime( start );
	return diff[ 0 ] * 1e9 + diff[ 1 ];
}

module.exports =
{
    nanosecond : nanosecond
};