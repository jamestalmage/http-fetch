'use strict';
var path = require('path');
var http = require('http');
var fs = require('fs');
var mkdirp = require('mkdirp');
var binaryVersion = require('../package.json').binaryVersion;
var findPath = require('./find-path');

module.exports = download;

function download(_cb) {
	// Only call the callback once
	function cb() {
		var __cb = _cb;
		_cb = null;
		__cb && __cb.apply(this, arguments);
	}

	var file = findPath();
	var url = 'http://jamestalmage.github.io/http-fetch/' + binaryVersion + '/' + file;
	var fullPath = path.join(__dirname, '..', 'downloads', file);

	mkdirp(path.dirname(fullPath), function (err) {
		if (err) {
			cb(err);
			return;
		}

		http.get(url, function (res) {
			// Treat non 200 status code as an error
			if (res.statusCode !== 200) {
				res.pipe(process.stderr);
				var error = new Error('could not fetch request binary: ' + res.statusCode + ':' + res.statusMessage);
				error.statusCode = res.statusCode;
				error.statusMessage = res.statusMessage;
				Object.defineProperty(error, 'res', {
					value: res
				});
				cb(error);
				return;
			}

			res
				.pipe(fs.createWriteStream(fullPath, {mode: 0o777}))
				.on('error', cb)
				.on('end', function () {
					cb(null, fullPath);
				});
		});
	});
}
