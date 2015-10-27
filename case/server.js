var connect = require('connect');
var open = require('opn');
var serveStatic = require('serve-static');
var log = require('gulp-util/lib/log');
var chalk = require('chalk');
var env = require('./lib/env');

module.exports = function (dir, port) {
	var host = 'http://localhost:' + port;

	return new Promise(function (resolve) {
		connect()
			.use(serveStatic(dir))
			.listen(port, function () {
				if (env.open) {
					open(host, typeof env.open === 'string' ? { app: env.open } : false);
				}
				log('Started server on ' + chalk.cyan(host));
				resolve();
			});
	});
};
