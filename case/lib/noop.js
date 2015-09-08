var PassThrough = require('readable-stream/passthrough');

module.exports = function () {
	return PassThrough({ objectMode: true });
};
