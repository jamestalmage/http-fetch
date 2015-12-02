'use strict';
var path = require('path');

module.exports = findPath;
module.exports.downloadTo = downloadTo;
module.exports.downloadFrom = downloadFrom;

var foundPath = null;
var pathFound = false;

function findPath() {
	if (pathFound) {
		return foundPath;
	}
	pathFound = true;

	var osFilterObj = require('os-filter-obj');

	var file = osFilterObj([
		{
			arch: 'x86',
			os: 'win32',
			path: 'windows_386/http-fetch.exe'
		},
		{
			arch: 'x64',
			os: 'win32',
			path: 'windows_amd64/http-fetch.exe'
		},
		{
			arch: 'x86',
			os: 'linux',
			path: 'linux_386/http-fetch'
		},
		{
			arch: 'x64',
			os: 'linux',
			path: 'linux_amd64/http-fetch'
		},
		{
			arch: 'x64',
			os: 'darwin',
			path: 'darwin_amd64/http-fetch'
		}
	]);

	if (file.length < 1) {
		return null;
	}

	foundPath = file[0].path;

	return foundPath;
}

var _binaryVersion;
function binaryVersion() {
	if (!_binaryVersion) {
		_binaryVersion = require('../package.json').binaryVersion;
	}

	return _binaryVersion;
}

function downloadTo() {
	var file = findPath();

	return file && path.join(__dirname, '..', 'downloads', file);
}

function downloadFrom() {
	var file = findPath();

	return file && 'http://jamestalmage.github.io/http-fetch/' + binaryVersion() + '/' + file;
}
