var path = require('path');
var pify = require('pify');
var exists = require('path-exists');
var del = require('del');
var fs = require('fs');
var writeFile = pify(fs.writeFile);
var inquirer = require('inquirer');
var chalk = require('chalk');
var extend = require('xtend');
var env = require('./lib/env');
var originalDefaults = require('./defaults');

function filterDir(dir) {
	return path.normalize(dir).split(path.sep).join('/');
}

function validateDir(dir) {
	return dir == 0 || /[?<>:*|"\\]/.test(dir) ? 'Invalid path' : true;
}

function validatePort(port) {
	return /^\d{2,5}$/.test(port) || 'Invalid port';
}

module.exports = function (defaults) {
	var configName;
	var config = extend(defaults);

	return inquirer.prompt([{
		name: 'configName',
		message: 'Enter config name',
		default: env.config
	}, {
		name: 'app',
		message: 'Enter source code directory',
		default: defaults.app,
		validate: validateDir,
		filter: filterDir
	}, {
		name: 'override',
		type: 'confirm',
		message: function (answers) {
			return '`' + answers.app + '` already exists, override?';
		},
		default: false,
		when: function (answers) {
			return exists(answers.app);
		}
	}, {
		name: 'assets',
		message: 'Enter assets (css, js, img) directory',
		default: defaults.assets,
		validate: validateDir,
		filter: filterDir
	}, {
		name: 'markup',
		type: 'confirm',
		message: 'Do you want to process markup?',
		default: defaults.markup
	}, {
		name: 'markup',
		message: 'Enter markup directory',
		default: defaults.markup || originalDefaults.markup,
		when: function (answers) {
			return answers.markup;
		},
		validate: validateDir,
		filter: filterDir
	}, {
		name: 'server',
		type: 'confirm',
		message: 'Do you want to start local server?',
		default: defaults.server,
		when: function (answers) {
			return answers.markup;
		}
	}, {
		name: 'port',
		message: 'Enter local server port',
		default: defaults.port,
		when: function (answers) {
			return answers.server;
		},
		validate: validatePort
	}]).then(function (answers) {
		configName = answers.configName;
		delete answers.configName;
		config = extend(config, answers);
		delete config.override;
		if (answers.override !== false) {
			return del(config.app).then(function () {
				return require('./init-fs')(config, false);
			});
		}
	}).then(function () {
		return writeFile(configName + '.json', JSON.stringify(config, null, 2) + '\n');
	}).then(function () {
		console.log(chalk.green('  Done! ') + 'Configuration saved in `caseconf.json`');
	});
};
