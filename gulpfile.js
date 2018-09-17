var gulp = require("gulp");
var include = require('gulp-html-tag-include');
var rename = require("gulp-rename");

var ts = require("gulp-typescript");
var tsProjectElectron = ts.createProject("tsconfig-electron.json");

gulp.task('electron-teiedit', function () {
  return gulp.src('teiedit/*.ts')
    .pipe(gulp.dest('temp-electron/teiedit/'))
});

gulp.task('electron-ui', function () {
  return gulp.src(['ui/opensave.ts', 'ui/init-electron.ts', 'ui/events.ts', 'ui/common.ts', 'ui/version.ts'])
    .pipe(gulp.dest('temp-electron/ui/'))
});

gulp.task('electron-msg', function () {
  return gulp.src(['msg/messages.ts'])
    .pipe(gulp.dest('temp-electron/msg/'))
});

gulp.task('electron-html', function () {
  // construct index.html
  return gulp.src(['./html/index.html','./html/body.html','./html/head.html'])
      .pipe(include())
      .pipe(gulp.dest('temp-electron/tmp/'));
});

gulp.task('electron-css', function () {
  return gulp.src('css/**')
    .pipe(gulp.dest('temp-electron/css/'))
});

gulp.task('electron-main', function () {
  return gulp.src(['index.js', 'temp-electron/tmp/index.html', 'favicon.icns', 'favicon.ico', 'package.json'])
    .pipe(gulp.dest('temp-electron/'))
});

gulp.task('electron-ts', function () {
    return tsProjectElectron.src()
        .pipe(tsProjectElectron())
        .js.pipe(gulp.dest("."));
});

gulp.task('electron-src', gulp.series('electron-teiedit', 'electron-ui', 'electron-msg', 'electron-css', 'electron-main'));
  
gulp.task('electron-models', function () {
  // copy test
  return gulp.src(['models/models.json', 'models/filedesc.odd', 'models/filedesc.css', 'models/media.odd',
   'models/partdesc.odd', 'models/partdesc.css', 'models/settingencodingdesc.odd', 'models/settingencodingdesc.css', 
   'models/teispoken.odd', 'models/teispoken.css', 'models/metaodd.odd',
   'models/olac.odd', 'models/olac.css'])
    .pipe(gulp.dest('temp-electron/models/'))
});

gulp.task('page-models', function () {
  // copy test
  return gulp.src(['models/models.json', 'models/filedesc.odd', 'models/filedesc.css', 'models/media.odd',
   'models/partdesc.odd', 'models/partdesc.css', 'models/settingencodingdesc.odd', 'models/settingencodingdesc.css', 
   'models/teispoken.odd', 'models/teispoken.css', 'models/metaodd.odd',
   'models/olac.odd', 'models/olac.css'])
    .pipe(gulp.dest('temp-page/models/'))
});

gulp.task('page-teiedit', function () {
  return gulp.src('teiedit/*.ts')
    .pipe(gulp.dest('temp-page/teiedit/'))
});

gulp.task('page-ui', function () {
  return gulp.src(['ui/opensave-singlepage.ts', 'ui/init-singlepage.ts', 'ui/events.ts', 'ui/common.ts', 'ui/version.ts'])
    .pipe(gulp.dest('temp-page/ui/'))
});

gulp.task('page-msg', function () {
  return gulp.src(['msg/messages.ts'])
    .pipe(gulp.dest('temp-page/msg/'))
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
   return gulp.src(['./html/teimeta.html','./html/body.html','./html/head.html'])
       .pipe(include())
       .pipe(gulp.dest('temp-page/tmp/'));
});

gulp.task('page-main', function () {
  return gulp.src(['temp-page/tmp/teimeta.html', 'favicon.ico'])
    .pipe(gulp.dest('temp-page/'))
});

gulp.task('page-src', gulp.series('page-teiedit', 'page-ui', 'page-msg', 'page-css', 'page-main'));

gulp.task('electron', gulp.series('electron-html', 'electron-src', 'electron-models', 'electron-ts'));

gulp.task('page-test1', function () {
  // copy test
  return gulp.src('test/**')
    .pipe(gulp.dest('/Library/WebServer/Documents/test/'))
});

gulp.task('page-test2', function () {
  // copy test teimeta
  return gulp.src('temp-page/**')
    .pipe(gulp.dest('/Library/WebServer/Documents/temp-page/'))
});

gulp.task('page-test3', function () {
  // copy test
  return gulp.src('temp-page/fonts/*')
    .pipe(gulp.dest('/Library/WebServer/Documents/test/fonts/'))
});

gulp.task('page-test4', function () {
  // copy test
  return gulp.src('temp-page/models/*')
    .pipe(gulp.dest('./dist/models/'))
});

gulp.task('page-test5', function () {
  // copy test
  return gulp.src('temp-page/fonts/*')
    .pipe(gulp.dest('./dist/fonts/'))
});

gulp.task('page-test6', function () {
  // copy test
  return gulp.src(['temp-page/bundle.js', 'temp-page/favicon.ico', 'temp-page/teimeta.html', 'temp-page/lib.js'])
    .pipe(gulp.dest('./dist/'))
});

gulp.task('page-test7', function () {
  // copy dist
  return gulp.src(['dist/**'])
    .pipe(gulp.dest('/Library/WebServer/Documents/dist/'))
});

gulp.task('page', gulp.series('page-html', 'page-src', 'page-ui2', 'page-models'));

gulp.task('test', gulp.series('page-test1', 'page-test2', 'page-test3', 'page-test4', 'page-test5', 'page-test6', 'page-test7'));
