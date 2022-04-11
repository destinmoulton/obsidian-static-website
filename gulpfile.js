const gulp = require("gulp");
const sass = require("gulp-sass");

gulp.task("compile:sass", function () {
    return gulp
        .src("sass/style.scss")
        .pipe(
            sass({
                outputStyle: "compressed",
            })
        )
        .pipe(gulp.dest("public/css/"));
});

gulp.task("watch", function () {
    gulp.watch(
        "sass/**/*.scss",
        { ignoreInitial: false },
        gulp.series(["compile:sass"])
    );
});
