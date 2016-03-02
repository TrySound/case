var gulp = require('gulp');
var extend = require('xtend');
var env = require('./case/lib/env');
var toggleTask = require('./case/lib/toggle-task');


var config;

try {
	config = require('./' + env.config);
} catch(e) {
	config = {};
} finally {
	config = extend(require('./case/defaults'), config);
}

if (config.markup !== false && typeof config.markup !== 'string') {
	config.markup = config.assets;
}


gulp.task('script', function () {
	var rollup = require('rollup').rollup;
	var eslint = require('rollup-plugin-eslint');
	var uglify = require('rollup-plugin-uglify');
	var commonjs = require('rollup-plugin-commonjs');
	var nodeResolve = require('rollup-plugin-node-resolve');

	return rollup({
		entry: config.app + '/script/main.js',
		plugins: [
			env.lint ? eslint() : {},
			nodeResolve({
				jsnext: true
			}),
			commonjs(),
			env.min ? uglify() : {}
		]
	}).then(function (bundle) {
		return bundle.write({
			format: 'iife',
			sourceMap: !env.min,
			dest: config.assets + '/js/main.js'
		});
	});
});

gulp.task('style', function () {
	var postcss = require('gulp-postcss');
	var stylelint = require('stylelint');
	var cssnano = require('cssnano');

	return gulp.src(config.app + '/style/main.css', {
			sourcemaps: !env.min
		})
		.pipe(postcss([
			env.lint ? stylelint : function () {},
			require('postcss-import')({
				plugins: [
					env.lint ? stylelint : function () {}
				]
			}),
			require('postcss-nested'),
			require('postcss-inline-svg'),
			require('postcss-clearfix'),
			require('postcss-pseudo-class-enter'),
			require('autoprefixer'),
			env.min ? cssnano({
				discardComments: {
					removeAll: true
				}
			}) : function () {},
			require('postcss-reporter')({
				clearMessages: true,
			})
		]))
		.pipe(gulp.dest(config.assets + '/css', {
			sourcemaps: !env.min && '.'
		}));
});

gulp.task('image', function () {
	var changed = require('gulp-changed');

	return gulp.src(config.app + '/image/**/*.{jpg,png,svg}')
		.pipe(changed(config.assets + '/img'))
		.pipe(gulp.dest(config.assets + '/img'));
});

gulp.task('markup', function () {
	if (!config.markup) {
		return Promise.resolve();
	}
	var nunjucks = require('gulp-nunjucks');

	return gulp.src(config.app + '/markup/[^_]*.html')
		.pipe(nunjucks.compile())
		.pipe(gulp.dest(config.markup));
});

gulp.task('init', function () {
	return require('./case/init')(config);
});

gulp.task('init-safe', function () {
	return require('./case/init-fs')(config, true);
});

gulp.task('server', function () {
	if (!config.markup || !config.server) {
		return Promise.resolve();
	}
	return require('./case/server')(config.markup, config.port);
});

gulp.task('clean', function () {
	return require('del')(config.assets);
});

gulp.task('build',
	gulp.series(
		toggleTask('clean', env.clean),
		gulp.parallel(
			toggleTask('markup', config.markup),
			'script',
			'style',
			'image'
		)
	)
);

function watch() {
	if (config.markup) {
		gulp.watch(
			config.app + '/markup/**/*.html',
			gulp.parallel('markup')
		);
	}
	gulp.watch(
		config.app + '/script/**/*.js',
		gulp.parallel('script')
	);
	gulp.watch(
		config.app + '/style/**/*.css',
		gulp.parallel('style')
	);
	gulp.watch(
		config.app + '/image/**/*.{jpg,png,svg}',
		gulp.parallel('image')
	);
	return Promise.resolve();
}

gulp.task('dev',
	gulp.series(
		'build',
		toggleTask('server', config.markup && config.server),
		watch
	)
);

gulp.task('default', gulp.parallel('build'));
