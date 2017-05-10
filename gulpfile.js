const gulp = require('gulp');
const babel = require('gulp-babel');

function build() {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015', 'stage-3']
        }))
        .pipe(gulp.dest('dist'));
}

gulp.task('build', build);