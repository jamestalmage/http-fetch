'use strict';
var which = require('which');
var fs = require('fs');
var path = require('path');
var child = require('child_process');

var fetch;

module.exports = main;
module.exports.sync = sync;
module.exports.download = download;
module.exports.findPath = findPath;
module.exports.withCurl = withCurl;
module.exports.withCurlSync = withCurlSync;
module.exports.withBinary = withBinary;
module.exports.withBinarySync = withBinarySync;
module.exports.getFallback = makeFallback.bind(null, null);

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
		fetch = fetch || _fetch;
		cb(null, fetch);
	});
}

function sync() {
	if (!fetch) {
		fetch = withCurlSync();
	}
	return fetch;
}

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

function withCurlSync() {
	try {
		return makeFetch(which.sync('curl'), ['-s']);
	} catch (e) {
		return withBinarySync();
	}
}

function withBinary(cb) {
	var downloadTo = findPath().downloadTo();

	if (!downloadTo) {
		console.log('could not find downloadTo path');
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

function withBinarySync() {
	var downloadTo = findPath().downloadTo();
	if (!downloadTo) {
		return makeFallback();
	}

	if (existsSync(downloadTo)) {
	  return makeFetch(downloadTo, []);
	}

	try {
		var downloadNow = path.join(__dirname, 'lib/download-now.js');
		exec(process.execPath, [downloadNow]);
	} catch (e) {
		return makeFallback();
	}

	if (existsSync(downloadTo)) {
		return makeFetch(downloadTo, []);
	}

	return makeFallback();
}

function existsSync(file) {
	if (fs.accessSync) {
		try {
			fs.accessSync(file, fs.X_OK);
			return true;
		} catch(e) {
			return false;
		}
	}
	return fs.existsSync(file);
}

function makeFallback(cb) {
	return makeFetch(
		process.execPath,
		[path.join(__dirname, 'lib/fallback.js')],
		cb
	);
}

function exec(cmd, args) {
	return child.execFileSync(cmd, args, {encoding: 'utf8'});
}

function makeFetch(cmd, args, cb) {
	function fetch(url) {
		return exec(cmd, args.concat([url]));
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

	cb && cb(null, fetch);
	return fetch;
}
