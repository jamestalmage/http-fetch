'use strict';

// A fallback implementation

var file = process.argv[2];
var http = require('http');

http.get(encodeURI(file), function (res) {

	if (res.statusCode !== 200) {
	  res
			.on('finish', exit(res.statusCode))
			.on('error', error)
			.pipe(process.stdout, {end: false});
	}

	res
		.on('error', error)
		.on('finish', exit(0))
		.pipe(process.stdout, {end: 'false'});

}).on('error', error);

function error(error) {
	console.error((error && error.stack) || error);
	exit(1);
}

var existingCode = 0;

function exit(code) {
	existingCode = code || existingCode;
	return function () {
		setTimeout(function () {
			process.exit(existingCode);
		});
	};
}
