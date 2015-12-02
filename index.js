'use strict';
var which = require('which');

function init(cb) {
}

function download(cb) {
	var http = require('http');
	var fs = require('fs');
	var osFilterObj = require('os-filter-obj');
	var binaryVersion = require('./package.json').binaryVersion;

	var file = osFilterObj([
		{
			arch: 'x86',
			os: 'win32',
			path: 'windows_386/http-fetch'
		},
		{
			arch: 'x64',
			os: 'win32',
			path: 'windows_amd64/http-fetch'
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

	file = file[0].path;
}
