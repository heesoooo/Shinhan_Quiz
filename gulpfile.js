const gulp = require('gulp'),
	del = require('del'),
	sass = require('gulp-sass'),
	cssnano = require('gulp-cssnano'),
	rename = require('gulp-rename'),
	fileinclude = require('gulp-file-include'),
	connect = require('gulp-connect'),
	browserSync = require('browser-sync').create(),
	reload = browserSync.reload;

const SRC = {
	SCSS: 'src/css/scss/*.scss',
};

//////////////////////// function ↓ //////////////////////////
function clean() {
	return del(['dist']);
}

function cleanCss() {
	return del([`dist/css/*.min.css`]);
}

// .scss -> .css 압축 저장
function cssTask() {
	return gulp.src(SRC.SCSS)
		.pipe(sass().on('error', sass.logError))
		.pipe(cssnano())
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(gulp.dest('dist/css'));
}

function htmlInclude() {
	return gulp.src(['src/html/**/*.html'])
	.pipe(fileinclude({
		prefix: '@@',
		basepath: '@file',
	}))
	//.pipe(connect.reload())
	.pipe(gulp.dest(['dist/html']));
}

function copyJs() {
	return gulp.src(['src/js/**.js'])
	.pipe(gulp.dest(['dist/js']));
}

function copyImg() {
	return gulp.src(['src/images/**/*.*'])
	.pipe(gulp.dest(['dist/images']));
}

// .on('change', reload); ->모든브라우저에 변경사항이 통보된다.
// Streams는 Browsersync에서 지원
function watchTask() {
	gulp.watch(SRC.SCSS, gulp.series(cleanCss, cssTask)).on('change', reload);
	gulp.watch('src/images/**/*.*', copyImg).on('change', reload);
	gulp.watch('src/js/**.js', copyJs).on('change', reload);
	gulp.watch('src/html/**/*.html', gulp.series(htmlInclude)).on('change', reload);
}

// workSheet파일 생성 및 실행
function serve() {
	browserSync.init({
		server: {
			baseDir: './',
			index: "worksheet.html"
		}
	});	
	watchTask();
}

// series는 순서대로, parallel는 동시실행
const build = gulp.series(clean, gulp.parallel(cssTask, copyImg, copyJs, htmlInclude));

exports.cleanCss = cleanCss;
exports.cssTask = cssTask;
exports.copyImg = copyImg;
exports.copyJs = copyJs;
exports.htmlInclude = htmlInclude;
exports.build = build;
exports.watchTask = watchTask;
exports.serve = serve;
exports.default = build;