var readFile = require('fs').readFileSync;
var yaml = require('js-yaml');

var rc;

module.exports = function () {
	rc = rc || yaml.safeLoad(readFile('.stylelintrc', 'utf-8'));

	return rc;
};
