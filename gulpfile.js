var gulp = require('gulp');
var react = require('gulp-react');
var concat = require('gulp-concat');
var gulpFilter = require('gulp-filter');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var browserify = require('gulp-browserify');
var packageJSON = require('./package.json');

gulp.task('css', function () {
    return gulp.src('./src/css/**.css')
        .pipe(concat('ngReactGrid.css'))
        .pipe(gulp.dest('./build/css'));
});

gulp.task('img', function () {
    return gulp.src('./src/img/**.png')
        .pipe(gulp.dest('./build/img'));
});

gulp.task('build-jsx', function () {
    return gulp.src(['./src/jsx/**.jsx'])
        .pipe(react())
        .pipe(gulp.dest('./src/js/jsx'))
});

gulp.task('build-grid', [ 'build-jsx'], function () {
    return gulp.src(['./src/js/main.js'])
        .pipe(browserify())
        .pipe(rename('ngReactGrid.js'))
        .pipe(replace(/{\$version}/g, packageJSON.version))
        .pipe(gulp.dest('./build/js/'))
});

gulp.task('uglify-build', ['build-grid'], function () {
    return gulp.src(['./build/js/ngReactGrid.js'])
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(rename('ngReactGrid.min.js'))
        .pipe(gulp.dest('./build/js'))
});

gulp.task('build', ['build-grid', 'uglify-build', 'css', 'img']);

gulp.task('default', ['build'], function () {
    gulp.watch('./src/**', ['build']);
});
