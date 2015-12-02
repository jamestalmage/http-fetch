'use strict';
var which = require('which');
var fs = require('fs');
var path = require('path');
var child = require('child_process');

var fetch;

module.exports = main;
module.exports.download = download;
module.exports.findPath = findPath;
module.exports.withCurl = withCurl;
module.exports.withBinary = withBinary;

function main(cb) {
	if (fetch) {
		setImmediate(function () {
			cb(null, fetch);
		});
		return;
	}
	withCurl(function (err, _fetch) {
		if (err) {
			cb(err);
			return;
		}
		fetch = _fetch;
		cb(null, fetch);
	});
}

module.exports.withFallback = function (cb) {
	setImmediate(function () {
		makeFallback(cb);
	});
};

function download (cb) {
	return require('./lib/download')(cb);
}

var _findPath;
function findPath() {
	return _findPath || (_findPath = require('./lib/find-path'));
}

function withCurl(cb) {
	which('curl', handleCurl);

	function handleCurl(err, resolved) {
		if (err) {
			withBinary(cb);
			return;
		}
		makeFetch(resolved, ['-s'], cb);
	}
}

function withBinary(cb) {
	var downloadTo = findPath().downloadTo();

	if (!downloadTo) {
		console.log('could not find downloadTo path')
		setImmediate(function () {
			makeFallback(cb);
		});
		return;
	}

	// Check if downloaded file already exists and we have access.
	if (fs.access) {
		fs.access(downloadTo, fs.X_OK, function (err) {
			if (err) {
				performDownload();
				return;
			}
			makeFetch(downloadTo, [], cb);
		});
		return;
	}

	// Fallback to just checking if the file exists if `fs.access` does not exist (older Node).
	fs.exists(downloadTo, function (exists) {
		if (exists) {
			makeFetch(downloadTo, [], cb);
			return;
		}
		performDownload();
	});

	// It does not exist. Download it.
	function performDownload() {
		download(function (err, downloadedTo) {
			if (err) {
				makeFallback(cb);
				return;
			}
			makeFetch(downloadedTo, [], cb);
		});
	}
}

function makeFallback(cb) {
	makeFetch(
		process.execPath,
		[path.join(__dirname, 'lib/fallback.js')],
		cb
	);
}

function makeFetch(cmd, args, cb) {
	function fetch(url) {
		return child.execFileSync(cmd, args.concat([url]), {encoding: 'utf8'});
	}

	Object.defineProperties(fetch, {
		cmd: {
			enumerable: true,
			value: cmd
		},
		args: {
			enumerable: true,
			get: function () {
				return args.slice();
			}
		}
	});

	cb(null, fetch);
}
