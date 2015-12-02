'use strict';
var gulp = require('gulp');
var child = require('child_process');
var which = require('which');
var goxc = which.sync('goxc');
var del = require('del');
var ghPages = require('gh-pages');
var path = require('path');
var httpFetch = require('./');

gulp.task('clean', function () {
	return del(['build', 'downloads']);
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

// Each time you do this, it adds largish files to git history in `gh-pages`, do so sparingly.
gulp.task('publish-binaries', function (done) {
	ghPages.publish(path.join(__dirname, 'build'), {add: true}, done);
});

gulp.task('get-google', function (done) {
	httpFetch(function (err, fetch) {
		console.log('foo');
		var s = fetch('http://www.google.com');
		console.log(s.substring(0, 100));
		console.log('bar');
		done();
	});
});

gulp.task('get-google:binary', function (done) {
	httpFetch.withBinary(function (err, fetch) {
		console.log('foo');
		var s = fetch('http://www.google.com');
		console.log(s.substring(0, 100));
		console.log('bar');
		done();
	});
});

gulp.task('get-google:fallback', function (done) {
	httpFetch.withFallback(function (err, fetch) {
		console.log('foo');
		var s = fetch('http://www.google.com');
		console.log(s.substring(0, 100));
		console.log('bar');
		done();
	});
});

