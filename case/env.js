var minimist = require('minimist');

module.exports = minimist(process.argv.slice(2), {
	alias: {
		m: 'min',
		l: 'lint',
		o: 'open',
		c: 'config'
	},
	default: {
		config: 'caseconfig'
	}
});
