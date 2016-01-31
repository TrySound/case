var gulp = require('gulp');
var extend = require('xtend');
var env = require('./case/lib/env');
var noop = require('./case/lib/noop');


var conf;

try {
	conf = require('./caseconf');
} catch(e) {
	conf = {};
} finally {
	conf = extend(require('./case/defaults'), conf);
}

if (conf.markup !== false && typeof conf.markup !== 'string') {
	conf.markup = conf.assets;
}


gulp.task('script', function (done) {
	var rollup = require('rollup').rollup;
	var eslint = require('rollup-plugin-eslint');
	var uglify = require('rollup-plugin-uglify');
	var commonjs = require('rollup-plugin-commonjs');
	var npm = require('rollup-plugin-npm');

	return rollup({
		entry: conf.app + '/script/main.js',
		plugins: [
			env.lint ? eslint() : {},
			npm(),
			commonjs(),
			env.min ? uglify() : {}
		]
	}).then(function (bundle) {
		return bundle.write({
			format: 'iife',
			sourceMap: !env.min,
			dest: conf.assets + '/js/main.js'
		});
	});
});

gulp.task('style', function (done) {
	var sourcemaps = require('gulp-sourcemaps');
	var postcss = require('gulp-postcss');
	var stylelint = env.lint ? require('stylelint') : function () {
		return function () {};
	};
	var cssnano = env.min ? require('cssnano') : function () {
		return function () {};
	};

	return gulp.src(conf.app + '/style/main.css')
		.pipe(!env.min ? sourcemaps.init() : noop())
		.pipe(postcss([
			stylelint,
			require('postcss-import')({
				plugins: [
					stylelint
				]
			}),
			require('postcss-nested'),
			require('postcss-inline-svg'),
			require('postcss-clearfix'),
			require('postcss-pseudo-class-enter'),
			require('autoprefixer'),
			cssnano({
				discardComments: {
					removeAll: true
				}
			}),
			require('postcss-reporter')({
				clearMessages: true,
			})
		]))
		.on('error', done)
		.pipe(!env.min ? sourcemaps.write('.') : noop())
		.pipe(gulp.dest(conf.assets + '/css'));
});

gulp.task('image', function () {
	var changed = require('gulp-changed');

	return gulp.src(conf.app + '/image/**/*.{jpg,png,svg}')
		.pipe(changed(conf.assets + '/img'))
		.pipe(gulp.dest(conf.assets + '/img'));
});

gulp.task('markup', function (done) {
	if (!conf.markup) {
		return done();
	}
	var include = require('gulp-file-include');

	return gulp.src(conf.app + '/markup/[^_]*.html')
		.pipe(include('//='))
		.on('error', done)
		.pipe(gulp.dest(conf.markup));
});

gulp.task('init', function () {
	return require('./case/init')(conf);
});

gulp.task('init-safe', function () {
	return require('./case/init-fs')(conf, true);
});

gulp.task('server', function (done) {
	if (!conf.markup || !conf.server) {
		return done();
	}
	return require('./case/server')(conf.markup, conf.port);
});

gulp.task('clean', function () {
	return require('del')(conf.assets);
});

gulp.task('build', env.clean ? ['clean'] : null, function () {
	var run = require('./case/lib/sequence');

	return run([
		conf.markup ? 'markup' : null,
		'script',
		'style',
		'image'
	]);
});

gulp.task('dev', function () {
	var run = require('./case/lib/sequence');
	var watch = require('./case/lib/watch');

	return run('build', conf.markup && conf.server ? 'server' : null).then(function () {
		if (conf.markup) {
			watch(conf.app + '/markup/**/*.html', 'markup');
		}
		watch(conf.app + '/script/**/*.js', 'script');
		watch(conf.app + '/style/**/*.css', 'style');
		watch(conf.app + '/image/**/*.{jpg,png,svg}', 'image');
	});
});

gulp.task('default', ['build']);
