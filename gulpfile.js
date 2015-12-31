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


gulp.task('script:lint', function (done) {
	var eslint = require('gulp-eslint');

	return gulp.src(conf.app + '/script/**/*.js')
		.pipe(eslint({
			reset: true,
		}))
		.on('error', done)
		.pipe(eslint.format());
});

gulp.task('script', env.lint ? ['script:lint'] : null, function (done) {
	var rollup = require('rollup').rollup;
	var uglify = require('rollup-plugin-uglify');

	return rollup({
		entry: conf.app + '/script/main.js',
		plugins: [
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

gulp.task('style:lint', function () {
	var postcss = require('gulp-postcss');

	return gulp.src(conf.app + '/style/**/*.css')
		.pipe(postcss([
			require('stylelint'),
			require('postcss-reporter')({
				clearMessages: true,
			})
		]));
});

gulp.task('style', env.lint ? ['style:lint'] : null, function (done) {
	var sourcemaps = require('gulp-sourcemaps');
	var postcss = require('gulp-postcss');

	return gulp.src(conf.app + '/style/main.css')
		.pipe(!env.min ? sourcemaps.init() : noop())
		.pipe(postcss([
			require('postcss-import')({
				path: conf.app + '/style'
			}),
			require('postcss-mixins')({
				mixinsFiles: conf.app + '/style/mixins/*.{js,json}'
			}),
			require('postcss-nested'),
			require('postcss-inline-svg'),
			require('postcss-clearfix'),
			require('postcss-pseudo-class-enter'),
			require('autoprefixer'),
			env.min ? require('cssnano')({
				discardComments: { removeAll: true }
			}) : function () {},
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
	var include = require('gulp-file-include');
	if (conf.markup) {
		return gulp.src(conf.app + '/markup/[^_]*.html')
			.pipe(include('//='))
			.on('error', done)
			.pipe(gulp.dest(conf.markup));
	}
	done();
});

gulp.task('init', function () {
	return require('./case/init')(conf);
});

gulp.task('init-safe', function () {
	return require('./case/init-fs')(conf, true);
});

gulp.task('server', function (done) {
	if (conf.markup && conf.server) {
		return require('./case/server')(conf.markup, conf.port);
	}
	done();
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
		'sprite',
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
		watch(conf.app + '/sprite/**/*.svg', 'sprite');
		watch(conf.app + '/image/**/*.{jpg,png,svg}', 'image');
	});
});

gulp.task('default', ['build']);
