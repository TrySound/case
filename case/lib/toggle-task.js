module.exports = function (task, condition) {
	if (condition) {
		return task;
	}

	var name = typeof task === 'function' ? (fn.name || fn.displayName) : task;

	function skipped(done){
		done();
	}

	skipped.displayName = name + ' (skipped)';

	return skipped;
};
