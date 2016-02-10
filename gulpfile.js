var gulp = require('gulp');
var extend = require('xtend');
var env = require('./case/lib/env');
var toggleTask = require('./case/lib/toggle-task');


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


gulp.task('script', function () {
	var rollup = require('rollup').rollup;
	var eslint = require('rollup-plugin-eslint');
	var uglify = require('rollup-plugin-uglify');
	var commonjs = require('rollup-plugin-commonjs');
	var nodeResolve = require('rollup-plugin-node-resolve');

	return rollup({
		entry: conf.app + '/script/main.js',
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
			dest: conf.assets + '/js/main.js'
		});
	});
});

gulp.task('style', function () {
	var postcss = require('gulp-postcss');
	var stylelint = require('stylelint');
	var cssnano = require('cssnano');

	return gulp.src(conf.app + '/style/main.css', {
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
		.pipe(gulp.dest(conf.assets + '/css', {
			sourcemaps: !env.min && { path: '.' }
		}));
});

gulp.task('image', function () {
	var changed = require('gulp-changed');

	return gulp.src(conf.app + '/image/**/*.{jpg,png,svg}')
		.pipe(changed(conf.assets + '/img'))
		.pipe(gulp.dest(conf.assets + '/img'));
});

gulp.task('markup', function () {
	if (!conf.markup) {
		return Promise.resolve();
	}
	var include = require('gulp-file-include');

	return gulp.src(conf.app + '/markup/[^_]*.html')
		.pipe(include('//='))
		.pipe(gulp.dest(conf.markup));
});

gulp.task('init', function () {
	return require('./case/init')(conf);
});

gulp.task('init-safe', function () {
	return require('./case/init-fs')(conf, true);
});

gulp.task('server', function () {
	if (!conf.markup || !conf.server) {
		return Promise.resolve();
	}
	return require('./case/server')(conf.markup, conf.port);
});

gulp.task('clean', function () {
	return require('del')(conf.assets);
});

gulp.task('build',
	gulp.series(
		toggleTask('clean', env.clean),
		gulp.parallel(
			toggleTask('markup', conf.markup),
			'script',
			'style',
			'image'
		)
	)
);

function watch() {
	if (conf.markup) {
		gulp.watch(
			conf.app + '/markup/**/*.html',
			gulp.parallel('markup')
		);
	}
	gulp.watch(
		conf.app + '/script/**/*.js',
		gulp.parallel('script')
	);
	gulp.watch(
		conf.app + '/style/**/*.css',
		gulp.parallel('style')
	);
	gulp.watch(
		conf.app + '/image/**/*.{jpg,png,svg}',
		gulp.parallel('image')
	);
	return Promise.resolve();
}

gulp.task('dev',
	gulp.series(
		'build',
		toggleTask('server', conf.markup && conf.server),
		watch
	)
);

gulp.task('default', gulp.parallel('build'));
