const browsersync      = require('browser-sync').create();
const gulp             = require('gulp');
const sass             = require('gulp-sass');
const minify           = require('gulp-minify');
const imagemin         = require('gulp-imagemin');
const rename           = require('gulp-rename');
const cleanCSS         = require('gulp-clean-css');
const phpConnect       = require('gulp-connect-php');
const del              = require('del');

const paths = {
  styles: {
    src: 'src/styles/**/*.sass',
    dest: 'dist/'
  },
  scripts: {
    src: 'src/scripts/**/*.js',
    dest: 'dist/scripts/'
  },
  images: {
    src: 'src/img/**/*',
    dest: 'dist/img/'
  },
  php: {
    srcNull: 'src/php/**/*',
    src: 'src/php/**/!(_)*',
    dest: 'dist/'
  }
};

function caminho() {
  const path = ('Current directory:' + process.cwd())
  console.log(path);
}

function browserSyncInit(done) {
  browserSync.init(config.plugins.browserSync)
  done();
}
gulp.task('browser-sync', browserSyncInit);

// BrowserSync
function bSync(done) {
  browsersync.init({
    proxy: 'localhost:8080',
    port: 3000,
    open: true,
    notify: false,
  });
  done();
}

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */
function clean() {
  // You can use multiple globbing patterns as you would with `gulp.src`,
  // for example if you are using del 2.0 or above, return its promise
  return del(paths.php.dest);
}

/*
 * Define our tasks using plain functions
 */
function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sass())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(cleanCSS())
    .pipe(browsersync.stream())
    // pass in options to the stream
    .pipe(rename({
      basename: 'style',
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browsersync.stream())
}

function scripts() {
  return gulp.src(paths.scripts.src, { srcmaps: true })
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(minify())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browsersync.stream())
}

function images() {
  return gulp.src(paths.images.src)
    .pipe(
      imagemin([
        imagemin.gifsicle({
          interlaced: true
        }),
        imagemin.mozjpeg({
          progressive: true,
        }),
        imagemin.optipng({
          optimizationLevel: 5
        }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browsersync.stream())
}

function php() {
  return gulp.src(paths.php.src)
    .pipe(gulp.dest(paths.php.dest))
    .pipe(browsersync.stream())
}

function watch() {
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.images.src, images);
  gulp.watch(paths.php.src, php);
  gulp.watch(paths.php.srcNull, php);
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.series(clean, gulp.parallel(bSync, watch, styles, scripts, images, php));

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean   = clean;
exports.styles  = styles;
exports.scripts = scripts;
exports.images  = images;
exports.php     = php;
exports.watch   = watch;
exports.build   = build;
/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = gulp.parallel(build);