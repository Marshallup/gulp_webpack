"use strict";
const { src, dest, task, series, watch, parallel } = require("gulp"),
  webpack = require("webpack"),
  gulpWebpack = require("webpack-stream"),
  webpackConfig = require("./webpack.config"),
  browserSync = require("browser-sync").create(),
  reload = browserSync.reload,
  plumber = require("gulp-plumber"),
  sourcemaps = require("gulp-sourcemaps"),
  clean = require("gulp-clean"),
  sass = require("gulp-sass"),
  postcss = require("gulp-postcss"),
  minifyCss = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  htmlValidator = require("gulp-w3c-html-validator"),
  pug = require("gulp-pug"),
  htmlmin = require("gulp-htmlmin"),
  imagemin = require("gulp-imagemin");

const paths = {
  build: {
    html: "dist/",
    js: "dist/assets/js/",
    css: "dist/assets/css/",
    images: "dist/assets/img/",
  },
  src: {
    html: "src/pug/pages/*.pug",
    js: "src/assets/js/app.js",
    css: "src/assets/scss/styles.scss",
    images: "src/assets/img/**/*.{jpg,png,svg,gif,ico}",
  },
  watch: {
    html: "src/**/*.pug",
    js: "src/assets/js/**/*.js",
    css: "src/assets/scss/**/*.scss",
    images: "src/assets/img/**/*.{jpg,png,svg,gif,ico}",
  },
  clean: "./dist/**",
};
const isDev = webpackConfig.isProd().bool;

task("server", () => {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
    open: true,
  });
});
task("clean", () => {
  return src(paths.clean, { read: false })
    .pipe(clean())
    .pipe(reload({ stream: true }));
});
task("html", () => {
  if (isDev) {
    return src(paths.src.html)
      .pipe(plumber())
      .pipe(
        pug({
          pretty: true,
        })
      )
      .pipe(dest(paths.build.html))
      .pipe(browserSync.stream());
  } else {
    return src(paths.src.html)
      .pipe(
        pug({
          pretty: true,
        })
      )
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(dest(paths.build.html));
  }
});
task("validateHtml", () => {
  return src(paths.src.html)
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(htmlValidator())
    .pipe(htmlValidator.reporter());
});
task("webpack", () => {
  return src(paths.src.js)
    .pipe(plumber())
    .pipe(gulpWebpack(webpackConfig.config, webpack))
    .pipe(dest(paths.build.js));
});
task("styles", () => {
  if (isDev) {
    return src(paths.src.css)
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass().on("error", sass.logError))
      .pipe(postcss(require("./postcss.config")))
      .pipe(sourcemaps.write())
      .pipe(minifyCss())
      .pipe(
        rename({
          suffix: ".min",
          extname: ".css",
        })
      )
      .pipe(dest(paths.build.css));
  } else {
    return src(paths.src.css)
      .pipe(sass().on("error", sass.logError))
      .pipe(postcss(require("./postcss.config")))
      .pipe(dest(paths.build.css))
      .pipe(minifyCss())
      .pipe(
        rename({
          suffix: ".min",
          extname: ".css",
        })
      )
      .pipe(dest(paths.build.css));
  }
});
task("imagemin", () => {
  return src(paths.src.images)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(dest(paths.build.images));
});
task("watch", () => {
  watch(paths.watch.html, series("html"));
  watch(paths.watch.js, series("webpack"));
  watch(paths.watch.html, series("styles"));
});
task(
  "default",
  series(
    "clean",
    parallel("html", "webpack", "styles"),
    parallel("watch", "server")
  )
);
task(
  "build",
  series("clean", parallel("html", "webpack", "styles", "imagemin"))
);
