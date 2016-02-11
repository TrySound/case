var connect = require('connect');
var open = require('opn');
var serveStatic = require('serve-static');
var log = require('gulplog');
var chalk = require('chalk');
var env = require('./lib/env');

module.exports = function (dir, port) {
	var host = 'http://localhost:' + port;

	return new Promise(function (resolve) {
		connect()
			.use(serveStatic(dir))
			.listen(port, function () {
				log.info('Started server on ' + chalk.cyan(host));
				resolve();
			});
	}).then(function () {
		var opts = typeof env.open === 'string' ? { app: env.open } : null;
		if (env.open) {
			return open(host, opts);
		}
	});
};
