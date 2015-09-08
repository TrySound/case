var gulp = require('gulp');

function parallel(tasks, cb) {
	var lastError;
	var executed = 0;

	function end(e) {
		var index = tasks.indexOf(e.task);

		if (index !== -1) {
			// Get only first error
			if (e && e.err && !lastError) {
				lastError = e.err;
			}

			executed += 1;

			// All tasks done
			if (executed === tasks.length) {
				gulp.removeListener('task_stop', end);
				gulp.removeListener('task_err', end);
				cb(lastError);
			}
		}
	}

	// Waiting for task end
	gulp.on('task_stop', end);
	gulp.on('task_err', end);

	// Run tasks separately
	tasks.forEach(function (task) {
		gulp.start(task);
	});
}

function run() {
	var tasks = [];

	// Skip undefined and invalid tasks
	// Convert to 2-D array of series and parallels
	[].forEach.call(arguments, function (task) {
		var set;
		if (typeof task === 'string' && gulp.hasTask(task)) {
			set = [task];
		}
		if (Array.isArray(task)) {
			set = task.filter(function (task) {
				return typeof task === 'string' && gulp.hasTask(task);
			});
		}

		if (set) {
			tasks.push(set);
		}
	});

	// Execute parallels in series
	return tasks.reduce(function (promise, task) {
		return promise.then(function () {
			return new Promise(function (resolve) {
				parallel(task, resolve);
			});
		});
	}, Promise.resolve());
}

module.exports = run;
