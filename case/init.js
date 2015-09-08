var pify = require('pify');
var exists = require('path-exists');
var del = require('del');
var fs = require('fs');
var writeFile = pify(fs.writeFile);
var inquirer = require('inquirer');
var chalk = require('chalk');
var extend = require('xtend');

function prompt(q) {
	return new Promise(function (resolve) {
		inquirer.prompt(q, resolve);
	});
}

function validateDir(dir) {
	var done = this.async();

	if (!/^[a-zA-Z0-9._-]+$/.test(dir)) {
		return done('Directory should contain only `a-zA-Z0-9._-`');
	}

	done(true);
}

module.exports = function (defaults) {
	var conf = extend(defaults);

	return Promise.resolve().then(function () {
		return prompt([{
			name: 'app',
			message: 'Enter source code directory',
			default: defaults.app,
			validate: validateDir
		}]);
	}).then(function (answers) {
		conf.app = answers.app;
		return exists(conf.app);
	}).then(function (exists) {
		if (exists) {
			return prompt([{
				name: 'override',
				message: '`' + conf.app + '` already exists, override?',
				default: false,
				type: 'confirm'
			}]);
		}
		return Promise.resolve({ override: true });
	}).then(function (answers) {
		if (answers.override) {
			return del(conf.app).then(function () {
				return require('./init-fs')(conf, false);
			});
		}
	}).then(function () {
		return prompt([{
			name: 'dst',
			message: 'Enter destination directory',
			default: defaults.dst,
			validate: validateDir
		}, {
			name: 'server',
			message: 'Do you want to start local server?',
			default: defaults.server,
			type: 'confirm'
		}, {
			name: 'port',
			message: 'Enter local server port',
			default: defaults.port,
			when: function (answers) {
				return answers.server;
			}
		}, {
			name: 'open',
			message: 'Do you want to open browser on server start?',
			default: defaults.open,
			type: 'confirm',
			when: function (answers) {
				return answers.server;
			}
		}]);
	}).then(function (answers) {
		conf = extend(conf, answers);
		return writeFile('caseconf.json', JSON.stringify(conf, null, 2) + '\n');
	}).then(function () {
		console.log(chalk.green('  Done! ') + 'Configuration saved in `caseconf.json`');
	});
};
