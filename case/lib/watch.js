var chokidar = require('chokidar');
var gulp = require('gulp');

var isWin = process.platform === 'win32';

module.exports = function (glob, task) {
	var cb;
	if (typeof task === 'string' || Array.isArray(task)) {
		cb = function () {
			gulp.start(task);
		};
	} else if (typeof task === 'function') {
		cb = task;
	}

	var watcher = chokidar.watch(glob, {
		ignoreInitial: true,
		usePolling: isWin
	});

	if (cb) {
		watcher
			.on('add', cb)
			.on('change', cb)
			.on('unlink', cb);
	}

	return watcher;
};
