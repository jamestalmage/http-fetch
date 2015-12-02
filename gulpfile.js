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

gulp.task('async-foo', function (done) {
	httpFetch.withCurl(foocb(done));
});

gulp.task('sync-foo', function () {
	foo(null, httpFetch.withCurlSync());
});

gulp.task('async-foo:binary', function (done) {
	httpFetch.withBinary(foocb(done));
});

gulp.task('sync-foo:binary', function () {
	foo(null, httpFetch.withBinarySync());
});

gulp.task('sync-foo:fallback', function () {
	var fetch = httpFetch.getFallback();
	foo(null, fetch);
});

function foo(err, fetch) {
	console.log('foo', fetch.cmd, fetch.args);
	var s = fetch('http://www.google.com');
	console.log(s.substring(0, 100));
	console.log('bar');
}

function foocb(cb) {
	return function (err, fetch) {
		try {
			foo(err, fetch);
			cb();
		} catch (e) {
			cb(e);
		}
	}
}

