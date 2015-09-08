var Transform = require('readable-stream/transform');
var PluginError = require('gulp-util/lib/PluginError');
var browserify = require('browserify');

module.exports = function (opts) {
	return Transform({
		objectMode: true,
		transform: function (file, enc, cb) {
			var lastErr;

			browserify(file.path, opts)
				.bundle(function (err, result) {
					if (err) {
						if (!lastErr) {
							lastErr = err;
							cb(new PluginError('browserify', err.toString()));
						}
					} else {
						file.contents = result;
						cb(null, file);
					}
				});
		}
	});
};
