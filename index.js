'use strict';
var which = require('which');
var path = require('path');

module.exports.download = function (cb) {
	require('./lib/download')(cb);
};

function init(cb) {
}
