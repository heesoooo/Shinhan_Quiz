const gulp = require('gulp'),
	del = require('del'),
	sass = require('gulp-sass'),
	cssnano = require('gulp-cssnano'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync').create(),
	reload = browserSync.reload;

const SRC = {
	SCSS: 'css/scss/*.scss',
	CSS: 'css/',
};

//////////////////////// function ↓ //////////////////////////
function cleanCss() {
	return del([`${SRC.CSS}/*.min.css`]);
}

// .scss -> .css 압축 저장
function cssTask() {
	return gulp.src(SRC.SCSS)
		.pipe(sass().on('error', sass.logError))
		.pipe(cssnano())
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(gulp.dest([SRC.CSS]));
}

// .on('change', reload); ->모든브라우저에 변경사항이 통보된다.
// Streams는 Browsersync에서 지원
function watchTask() {
	gulp.watch(SRC.SCSS, gulp.series(cleanCss, cssTask)).on('change', reload);
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
const build = gulp.series(cleanCss, gulp.parallel(cssTask));

exports.cleanCss = cleanCss;
exports.cssTask = cssTask;
exports.build = build;
exports.watchTask = watchTask;
exports.serve = serve;
exports.default = build;