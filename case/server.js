var connect = require('connect');
var open = require('opn');
var serveStatic = require('serve-static');
var log = require('gulp-util/lib/log');
var chalk = require('chalk');

module.exports = function (dir, port, opener) {
	var host = 'http://localhost:' + port;
	var opts = typeof opener === 'string' ? { app: opener } : undefined;

	return new Promise(function (resolve) {
		connect()
			.use(serveStatic(dir))
			.listen(port, function () {
				if (opener) {
					open(host, opts);
				}
				log('Started server on ' + chalk.cyan(host));
				resolve();
			});
	});
};
