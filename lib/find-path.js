'use strict';
module.exports = findPath;

var osFilterObj = require('os-filter-obj');
var foundPath = null;

function findPath() {
	if (foundPath) {
		return foundPath;
	}

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
		throw new Error('could not find a download to match os and architecture');
	}

	return foundPath = file[0].path;
}
