'use strict';

require('./download')(function (err) {
	if (err) {
		console.error(err);
		process.exit(1);
	}
});
