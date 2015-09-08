var connect = require('connect');
var open = require('open');
var serveStatic = require('serve-static');
var log = require('gulp-util/lib/log');
var chalk = require('chalk');

module.exports = function (dir, port, shouldOpen) {
	var host = 'http://localhost:' + port;

	return new Promise(function (resolve) {
		connect()
			.use(serveStatic(dir))
			.listen(port, function () {
				if (shouldOpen) {
					open(host);
				}
				log('Started server on ' + chalk.cyan(host));
				resolve();
			});
	});
};
