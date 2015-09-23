var pify = require('pify');
var mkdirp = pify(require('mkdirp'));
var fs = require('fs');
var readFile = pify(fs.readFile);
var writeFile = pify(fs.writeFile);
var appendFile = pify(fs.appendFile);


module.exports = function (conf, safe) {
	var app = conf.app;
	var write = safe ? appendFile : writeFile;

	return Promise.all([
		mkdirp(app + '/markup/modules'),
		mkdirp(app + '/style/shared'),
		mkdirp(app + '/style/modules'),
		mkdirp(app + '/style/mixins'),
		mkdirp(app + '/script/shared'),
		mkdirp(app + '/script/modules'),
		mkdirp(app + '/sprite'),
		mkdirp(app + '/image')
	]).then(function () {
		if (safe) {
			return ['', '', ''];
		} else {
			return Promise.all([
				readFile('case/template/markup.html', 'utf-8'),
				Promise.resolve(''),
				Promise.resolve('')
			]);
		}
	}).then(function (templates) {
		return Promise.all([
			write(app + '/markup/index.html', templates[0]),
			write(app + '/style/main.css', templates[1]),
			write(app + '/script/main.js', templates[2])
		]);
	});
};
