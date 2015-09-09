var path = require('path');
var pify = require('pify');
var exists = require('path-exists');
var del = require('del');
var fs = require('fs');
var writeFile = pify(fs.writeFile);
var inquirer = require('inquirer');
var chalk = require('chalk');
var extend = require('xtend');
var originalDefaults = require('./defaults');

function prompt(q) {
	return new Promise(function (resolve) {
		inquirer.prompt(q, resolve);
	});
}

function validateDir(dir) {
	return dir == 0 ? 'Invalid directory' : true;
}

module.exports = function (defaults) {
	var conf = extend(defaults);

	return prompt([{
		name: 'app',
		message: 'Enter source code directory',
		default: defaults.app,
		validate: validateDir,
		filter: path.normalize
	}, {
		name: 'override',
		type: 'confirm',
		message: function (answers) {
			return '`' + answers.app + '` already exists, override?';
		},
		default: false,
		when: function (answers) {
			exists(answers.app).then(this.async());
		}
	}, {
		name: 'assets',
		message: 'Enter assets (css, js, img) directory',
		default: defaults.assets,
		validate: validateDir,
		filter: path.normalize
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
		filter: path.normalize
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
		}
	}, {
		name: 'open',
		type: 'confirm',
		message: 'Do you want to open browser on server start?',
		default: defaults.open,
		when: function (answers) {
			return answers.server;
		}
	}]).then(function (answers) {
		conf = extend(conf, answers);
		delete conf.override;
		if (answers.override !== false) {
			return del(conf.app).then(function () {
				return require('./init-fs')(conf, false);
			});
		}
	}).then(function () {
		return writeFile('caseconf.json', JSON.stringify(conf, null, 2) + '\n');
	}).then(function () {
		console.log(chalk.green('  Done! ') + 'Configuration saved in `caseconf.json`');
	});
};
