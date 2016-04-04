// Include gulp
var gulp = require('gulp');

// Include Plugins
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var appPath = "app/";
var Devutils = require('./dev/devutils.js');

var devutils = new Devutils('./');

gulp.task('sass', function () {
    gulp.src(appPath + '!(_)*.scss')
        .pipe(concat('app.css'))
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(appPath + 'css'));
});

gulp.task('scripts', function() {
    return gulp.src(appPath + '**/*.js')
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('includeLib', function(){
    return gulp.src('./app/bower_components/**/*.min.js')
        .pipe(devutils.generateLibIncl());
});

gulp.task('includeSrc', function(){
    return gulp.src('./app/src/**/*.js')
        .pipe(devutils.generateIndex('./app'));
});

gulp.task('devscripts', function(cb) {
    runSequence('includeLib',
        'includeSrc',
        cb);
});

gulp.task('devcompile', function(cb) {
    runSequence('sass',
        'devscripts',
        cb);
});
