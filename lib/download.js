'use strict';
var path = require('path');
var http = require('http');
var fs = require('fs');
var mkdirp = require('mkdirp');
var findPath = require('./find-path');

module.exports = download;

function download(_cb) {
	// Only call the callback once
	function cb() {
		var __cb = _cb;
		_cb = null;
		__cb && __cb.apply(this, arguments);
	}

	var url = findPath.downloadFrom();
	if (!url) {
		setTimeout(function () {
			cb(new Error('can not find a suitable download for system architecture'));
		});
	}

	var fullPath = findPath.downloadTo();

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
				.on('finish', function () {
					cb(null, fullPath);
				});
		});
	});
}
