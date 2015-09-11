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
	var sourcemaps = require('gulp-sourcemaps');
	var browserify = require('./case/lib/browserify');
	var uglify = require('gulp-uglify');

	return gulp.src(conf.app + '/script/main.js', { read: false })
		.pipe(browserify({
			paths: conf.app + '/script',
			debug: !env.min
		}))
		.on('error', done)
		.pipe(!env.min ? sourcemaps.init({ loadMaps: true }) : noop())
		.pipe(env.min ? uglify() : noop())
		.on('error', done)
		.pipe(!env.min ? sourcemaps.write('.') : noop())
		.pipe(gulp.dest(conf.assets + '/js'));
});

gulp.task('style:lint', function () {
	var postcss = require('gulp-postcss');
	var rc = require('./case/lib/getstylelintrc')();

	return gulp.src(conf.app + '/style/**/*.css')
		.pipe(postcss([
			require('stylelint')(rc),
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
			require('postcss-nested'),
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

gulp.task('sprite', function (done) {
	var svgstore = require('gulp-svgstore');
	var svgmin = require('gulp-svgmin');
	var rename = require('gulp-rename');

	return gulp.src(conf.app + '/sprite/**/[^_]*.svg')
		.pipe(rename({prefix: 'shape-'}))
		.pipe(svgmin())
		.on('error', done)
		.pipe(svgstore({
			inlineSvg: true
		}))
		.on('error', done)
		.pipe(svgmin({
			js2svg: {
				pretty: true,
				indent: '\t'
			},
			plugins: [{
				cleanupIDs: false
			}]
		}))
		.on('error', done)
		.pipe(rename('sprite.svg'))
		.pipe(gulp.dest(conf.assets + '/img'));
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
		return require('./case/server')(conf.markup, conf.port, conf.open);
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
