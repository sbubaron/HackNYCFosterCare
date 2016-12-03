// gulp file influenced by: http://webdesign.tutsplus.com/tutorials/combining-pattern-lab-with-gulp-for-improved-workflow--cms-22187

var gulp = require('gulp')
var bless = require('gulp-bless')
var mqRemove = require('gulp-mq-remove')
// var compass = require('gulp-compass');
var sass = require('gulp-sass')
var gutil = require('gulp-util')
// var notify = require('gulp-notify');
var autoprefixer = require('gulp-autoprefixer')
var rename = require('gulp-rename')
var minifycss = require('gulp-clean-css')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')
// var jshint = require('gulp-jshint')
var browserSync = require('browser-sync')
var clean = require('gulp-clean')
// var todo = require('gulp-todo')
var fs = require('fs')
// var path = require('path');
// var template = require('lodash.template');
// var through = require('through2');
// var directoryMap = require("gulp-directory-map");
var bump = require('gulp-bump')
var config = require('./gulp.config.json')
// var localconfig = require('./gulp.config.local.json')
// var shell = require('gulp-shell');
var buildArgs = require('./gulp.build.args.js')
var runSequence = require('run-sequence')
var git = require('gulp-git')
var zip = require('gulp-zip')

gulp.task('bump', function () {
  return gulp.src(['./package.json'])
    .pipe(bump({type: buildArgs.versionBumpType}))
    .pipe(gulp.dest('./'))
})

gulp.task('commit-changes', function () {
  return gulp.src('.')
    .pipe(git.add())
    .pipe(git.commit('[Prerelease] Bumped version number'))
})

gulp.task('push-changes', function (cb) {
  git.push('origin', 'master', cb)
})

gulp.task('create-new-tag', function (cb) {
  var version = getPackageJsonVersion()
  git.tag(version, 'Created Tag for version: ' + version, function (error) {
    if (error) {
      return cb(error)
    }
    git.push('origin', 'master', {args: '--tags'}, cb)
  })

  function getPackageJsonVersion () {
    // We parse the json file instead of using require because require caches
    // multiple calls so the version number won't be updated
    return JSON.parse(fs.readFileSync('./package.json', 'utf8')).version
  };
})

gulp.task('release', function (callback) {
  runSequence(
    'bump',
//    'changelog',
    'commit-changes',
    'push-changes',
    'create-new-tag',
    'copy:release',
    'copy:distribute',
//    'github-release',
    function (error) {
      if (error) {
        console.log(error.message)
      } else {
        console.log('RELEASE FINISHED SUCCESSFULLY')
      }
      callback(error)
    })
})

gulp.task('copy:release', function () {
  var pkg = require('./package.json')
  gulp.src(config.release.complete_src)
        .pipe(gulp.dest(config.release.dest + '/' + pkg.version + '/' + pkg.version + '-pattern-lab'))
        .pipe(zip(pkg.version + '-pattern-lab.zip'))
        .pipe(gulp.dest(config.release.dest + '/' + pkg.version))
})

gulp.task('copy:distribute', function () {
  var pkg = require('./package.json')
  var dest = config.release.dest + '/' + pkg.version + '/' + pkg.version + '-distribute/'

  var stream = gulp.src(config.release.distribute_src, { base: config.release.base })
                    .pipe(gulp.dest(dest))
                    .pipe(zip(pkg.version + '-distribute.zip'))
                    .pipe(gulp.dest(config.release.dest + '/' + pkg.version))

  return stream
})

// Description: Removing compiled files before running other tasks, this helps keep deleted source files from sticking around
gulp.task('clean:before', function () {
  return gulp.src([config.images.dest, config.fonts.dest, config.jsheader.dest, config.jsfooter.dest, config.scss.dest])
    .pipe(clean({
      force: true
    }))
})

// concatenate and minify headerjs files
gulp.task('jsheader', function () {
  return gulp.src(config.jsheader.src)
        .pipe(concat('header.dev.js'))
        .pipe(gulp.dest(config.jsheader.dest))
        .pipe(rename('header.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.jsheader.dest))
        .pipe(browserSync.reload({stream: true}))
})

// Concatenate & Minify Footer JS files
gulp.task('jsfooter', function () {
  return gulp.src(config.jsfooter.src)
        .pipe(concat('footer.dev.js'))
        .pipe(gulp.dest(config.jsfooter.dest))
        .pipe(rename('footer.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.jsfooter.dest))
        .pipe(browserSync.reload({stream: true}))
})

// copy fonts to wwwroot
gulp.task('fonts', function () {
  return gulp.src(config.fonts.src)
        .pipe(gulp.dest(config.fonts.dest))
        .pipe(browserSync.reload({stream: true}))
})

// copy images to wwwroot
gulp.task('images', function () {
  return gulp.src(config.images.src)
        .pipe(gulp.dest(config.images.dest))
        .pipe(browserSync.reload({stream: true}))
})

gulp.task('html', function () {
  return gulp.src(config.html.src)
        .pipe(browserSync.reload({stream: true}))
})

// generate style.css and minified/blessed variants
gulp.task('scss', function () {
  gulp.src(config.scss.files)
        .pipe(sass({
          css: config.scss.dest,
          sass: 'scss',
          fonts: 'fonts',
          debug: true,
          style: 'expanded',
          comments: true,
          sourceComments: true,
          sourcemap: false
        })).on('error', gutil.log)
        .pipe(browserSync.reload({stream: true}))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest(config.scss.dest))
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(config.scss.dest))
        .pipe(rename({
          suffix: '.blessed.ie89'
        }))
        .pipe(bless())
        .pipe(gulp.dest(config.scss.dest))
        .pipe(mqRemove({ width: '1280px' }))
        .pipe(rename({
          suffix: '.blessed.ie7'
        }))
        .pipe(bless())
        .pipe(browserSync.reload({stream: true}))
})

// task: BrowserSync
// Description: Run BrowserSync server with disabled ghost mode
gulp.task('browser-sync', function () {
  browserSync({
   // server: {
   //   baseDir: config.wwwroot,
   //   middleware: function (req, res, next) {
   //     res.setHeader('Access-Control-Allow-Origin', '*')
   //     next()
   //   }
   // },
    proxy: 'starquotes.box:3000',
    host: 'localhost',
    port: 4000,
    ghostMode: true,
    // https: {
    //  key: '.cert/localdev.DoITComm.key',
    //  cert: '.cert/localdev.DoITComm.pem'
    // },
    open: 'external'
  })
})

// Task: Default
// Description: Build all stuff of the project once
gulp.task('default', ['clean:before'], function () {
  gulp.start(
    'fonts',
    'images',
    'scss',
    'jsheader',
    'jsfooter'
  )
})

// Task: Start your production-process
// Description: Typ 'gulp' in the terminal
gulp.task('serve', function () {
  gulp.start(
    'browser-sync',
    'default',
    'watch'
  )
})

// Task: Watch files
gulp.task('watch', function () {
  gulp.watch(
    config.html.src,
    ['html']
  )

  // Watch scripts
  gulp.watch(
    config.jsheader.src,
    ['jsheader']
  )

  gulp.watch(
    config.jsfooter.src,
    ['jsfooter']
  )

  // Watch images
  gulp.watch(
    config.images.src,
    ['images']
  )

  // Watch Sass
  gulp.watch(
    config.scss.src,
    ['scss']
  )

  // Watch fonts
  gulp.watch(
    config.fonts.src,
    ['fonts']
  )
})
