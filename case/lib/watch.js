var chokidar = require('chokidar');
var gulp = require('gulp');

module.exports = function (glob, task) {
	if (typeof task === 'string' || Array.isArray(task)) {
		function cb() {
			gulp.start(task);
		};
	}

	chokidar.watch(glob, { ignoreInitial: true })
		.on('add', cb)
		.on('change', cb)
		.on('unlink', cb);
};
