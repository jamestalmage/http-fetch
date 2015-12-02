'use strict';
var gulp = require('gulp');
var child = require('child_process');
var which = require('which');
var goxc = which.sync('goxc');
var del = require('del');

gulp.task('clean', function () {
	return del(['build']);
});

// Compile the Go binaries.
gulp.task('compile', function (done) {
	child
		.spawn(goxc, [], {stdio: 'inherit'})
		.on('error', done)
		.on('exit', function (code) {
			if (code) {
				done(new Error('compile exited with ' + code));
				return;
			}
			done();
		});
});

