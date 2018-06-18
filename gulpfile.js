var gulp = require("gulp");
var include = require('gulp-html-tag-include');
var runSequence = require('run-sequence');
var rename = require("gulp-rename");

var ts = require("gulp-typescript");
var tsProjectElectron = ts.createProject("tsconfig-electron.json");

gulp.task('electron-teiedit', function () {
  return gulp.src('teiedit/*.ts')
    .pipe(gulp.dest('temp-electron/teiedit/'))
});

gulp.task('electron-ui', function () {
  return gulp.src(['ui/opensave.ts', 'ui/init-electron.ts', 'ui/events.ts', 'ui/common.ts', 'ui/version.ts', 'ui/alert.ts', 'ui/messages.ts'])
    .pipe(gulp.dest('temp-electron/ui/'))
});

gulp.task('electron-js', function () {
  return gulp.src('js/picoModal.js')
    .pipe(gulp.dest('temp-electron/js/'))
});

gulp.task('electron-html', function () {
  // construct index.html
   return gulp.src('./html/index.html')
       .pipe(include())
       .pipe(gulp.dest('.'));
});

gulp.task('electron-css', function () {
  return gulp.src('css/**')
    .pipe(gulp.dest('temp-electron/css/'))
});

gulp.task('electron-main', function () {
  return gulp.src(['index.js', 'index.html', 'favicon.icns', 'favicon.ico', 'package.json'])
    .pipe(gulp.dest('temp-electron/'))
});

gulp.task('electron-ts', function () {
    return tsProjectElectron.src()
        .pipe(tsProjectElectron())
        .js.pipe(gulp.dest("."));
});

gulp.task('electron-src', ['electron-teiedit', 'electron-ui', 'electron-css', 'electron-main']);

gulp.task('page-teiedit', function () {
  return gulp.src('teiedit/*.ts')
    .pipe(gulp.dest('temp-page/teiedit/'))
});

gulp.task('page-ui', function () {
  return gulp.src(['ui/opensave-singlepage.ts', 'ui/init-singlepage.ts', 'ui/events.ts', 'ui/common.ts', 'ui/version.ts', 'ui/alert.ts', 'ui/messages.ts'])
    .pipe(gulp.dest('temp-page/ui/'))
});

gulp.task('page-ui2', function () {
  return gulp.src(['temp-page/ui/opensave-singlepage.ts'])
    .pipe(rename('temp-page/ui/opensave.ts'))
    .pipe(gulp.dest('.'))
});

gulp.task('page-js', function () {
  return gulp.src(['js/stretchy.js', 'js/awesomplete.js'])
    .pipe(gulp.dest('temp-page/js/'))
});

gulp.task('page-css', function () {
  return gulp.src('css/**')
    .pipe(gulp.dest('temp-page/css/'))
});

gulp.task('page-html', function () {
  // construct index.html
   return gulp.src('./html/teimeta.html')
       .pipe(include())
       .pipe(gulp.dest('.'));
});

gulp.task('page-main', function () {
  return gulp.src(['teimeta.html', 'favicon.ico'])
    .pipe(gulp.dest('temp-page/'))
});

gulp.task('page-src', ['page-teiedit', 'page-ui', 'page-css', 'page-main']);

gulp.task('electron', function(done) {
    runSequence('electron-html', 'electron-src', 'electron-ts', function() {
        console.log('ok.');
        done();
    });
});

gulp.task('page', function(done) {
//    runSequence('page-src', 'page-ui2', 'page-js', function() {
    runSequence('page-html', 'page-src', 'page-ui2', function() {
        console.log('ok.');
        done();
    });
});
