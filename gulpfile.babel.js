"use strict";

import gulp from "gulp";
import autoprefixer from "gulp-autoprefixer";
import cssbeautify from "gulp-cssbeautify";
import removeComments from "gulp-strip-css-comments";
import rename from "gulp-rename";
import sass from "gulp-sass";
import cssnano from "gulp-cssnano";
import rigger from "gulp-rigger";
import uglify from "gulp-uglify";
import plumber from "gulp-plumber";
import imagemin from "gulp-imagemin";
import babel from "gulp-babel";
import del from "del";
import browserSync from "browser-sync";

// Paths to source/build/watch files
//=========================

const paths = {
  build: "build/",
  fonts: {
    src: "src/assets/fonts/**/*.*",
    dest: "build/assets/fonts/"
  },
  images: {
    src: "src/assets/img/**/*.{jpg,jpeg,png,svg,ico}",
    dest: "build/assets/img/"
  },
  scripts: {
    src: "src/assets/js/*.js",
    src_w: "src/assets/js/**/*.js",
    dest: "build/assets/js/"
  },
  files_lib: {
    src: "src/assets/lib/**/*.{js,css}",
    dest: "build/assets/lib/"
  },
  styles: {
    src: "src/assets/sass/style.scss",
    w_src: "src/assets/sass/**/*.scss",
    dest: "build/assets/css/"
  },
  html: {
	src: "src/*.{htm,html,php}",
	src_w: "src/**/*.{htm,html,php}",
    dest: "build/"
  }
};

function clean() {
  return del(paths.build);
}

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(plumber())
    .pipe(sass({
		includePaths: ['./node_modules']
	  }).on("error", sass.logError))
    .pipe(
      autoprefixer({
        browsers: ["> 0%"],
        cascade: false
      })
    )
    .pipe(cssbeautify())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(
      cssnano({
        zindex: false,
        discardComments: {
          removeAll: true
        }
      })
    )
    .pipe(removeComments())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest(paths.styles.dest))
    .on("end", browserSync.reload);
}

function scripts() {
  return gulp
	.src(paths.scripts.src, { sourcemaps: true })
	.pipe(rigger())
    .pipe(babel())
    .pipe(plumber())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(uglify())
    .pipe(rename("main.min.js"))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}

function lib() {
  return gulp
	  .src(paths.files_lib.src)
    .pipe(gulp.dest(paths.files_lib.dest))
    .pipe(browserSync.stream());
}

function fonts() {
  return gulp
    .src(paths.fonts.src, { since: gulp.lastRun("fonts") })
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(browserSync.stream());
}

function images() {
  return gulp
    .src(paths.images.src)
    .pipe(
      imagemin({
        optimizationLevel: 3,
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true
      })
    )
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
}

function html() {
  return gulp
    .src(paths.html.src)
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest(paths.html.dest))
    .on("end", browserSync.reload);
}

function watchAssets() {
  gulp.watch(paths.scripts.src_w, scripts);
  gulp.watch(paths.styles.w_src, styles);
  gulp.watch(paths.fonts.src, fonts);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.html.src_w, html);
  gulp.watch(paths.files_lib.src, lib);

  browserSync.init({
    server: {
      baseDir: paths.build
    }
  });
}

exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.lib = lib;
exports.fonts = fonts;
exports.images = images;
exports.html = html;
exports.watchAssets = watchAssets;

const build = gulp.series(
  clean,
  gulp.parallel(styles, scripts, images, fonts, html, lib)
);

gulp.task("watch", gulp.series(build, watchAssets));
