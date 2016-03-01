// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var devutils = require('./dev/devutils.js');

gulp.task('scripts', function() {
    return gulp.src('app/**/*.js')
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('includebower', function() {
    return gulp.src('app/bower_components/**/*.min.js')
        .pipe(devutils.generateIncludeFile('bower_components/','app/templates/_bowercomp.html'));
});

gulp.task('devscripts', function() {
    return gulp.src('app/src/**/*.js')
        .pipe(devutils.generateIncludeFile('src/','app/templates/_includes.html'));

});