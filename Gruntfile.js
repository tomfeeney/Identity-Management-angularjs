// Generated on 2013-09-28 using generator-angular 0.4.0
'use strict';

module.exports = function (grunt) {
  
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  try {
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
  } catch (e) {}

  grunt.initConfig({
    
    yeoman: yeomanConfig,
    
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
    
    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
      dist: {}
    },*/
    
    useminPrepare: {
      html: '<%= yeoman.app %>/*index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.app %>/*index.html'],
//      css: ['<%= yeoman.dist %>/styles/**/*.css'],
      options: {
        dirs: ['<%= yeoman.app %>']
      }
    },
    
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/img',
          src: '**/*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/img'
        }]
      }
    },
    
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/img',
          src: '**/*.svg',
          dest: '<%= yeoman.dist %>/img'
        }]
      }
    },
    
    cssmin: {
      // By default, your `index.html` <!-- Usemin Block --> will take care of
      // minification. This option is pre-configured if you do not wish to use
      // Usemin blocks.
//       dist: {
//         files: {
//           '<%= yeoman.app %>/dist/main.css': [
//             '.tmp/styles/**/*.css',
//             '<%= yeoman.app %>/styles/**/*.css'
//           ]
//         }
//       },
      webid: {
        files: {
          '<%= yeoman.app %>/dist/webidmain.css': [
            '<%= yeoman.app %>/bower_components/dialogs/dialogs.min.css',
            '<%= yeoman.app %>/bower_components/angular-block-ui/angular-block-ui.css',
            '<%= yeoman.app %>/styles/global.css',
            '<%= yeoman.app %>/styles/hp-btn.css',
            '<%= yeoman.app %>/styles/webid-typography.css',
            '<%= yeoman.app %>/styles/hpWebId.css'
          ]
        }
      }
    },
    
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', 'views/**/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            '3rd_vendors/**/*',
            'config/**/*',
            'img/**/*.{gif,webp}',
            'styles/fonts/**/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/img',
          dest: '<%= yeoman.dist %>/img',
          src: [
            'generated/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
//        dest: '.tmp/styles/',
        dest: '<%= yeoman.dist %>/styles/',
        src: '**/*.css'
      }
    },
    
    concurrent: {
      server: [
        'copy:styles'
      ],
      test: [
        'copy:styles'
      ],
      dist: [
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin'
      ]
    },
    
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/scripts',
          src: '**/*.js',
          dest: '.tmp/scripts'
        }]
      }
    },
    
    uglify: {
      options: {
        mangle: false
      },
      dist: {
        files: {
          '<%= yeoman.app %>/dist/scripts.js': [
            '.tmp/scripts/**/*.js',
            '!.tmp/scripts/*app.js'
          ]
        }
      },
      webidlib: {
        files: {
          '<%= yeoman.app %>/dist/webidlibrary.js': [
            '<%= yeoman.dist %>/bower_components/underscore/underscore-min.js',
            '<%= yeoman.dist %>/bower_components/angular-route/angular-route.min.js',
            '<%= yeoman.dist %>/bower_components/angular-resource/angular-resource.min.js',
            '<%= yeoman.dist %>/bower_components/angular-sanitize/angular-sanitize.min.js',
            '<%= yeoman.dist %>/bower_components/angular-translate/angular-translate.min.js',
            '<%= yeoman.dist %>/bower_components/angular-underscore/angular-underscore.min.js',
            '<%= yeoman.dist %>/bower_components/angular-block-ui/angular-block-ui.js',
            '<%= yeoman.dist %>/bower_components/angular-webstorage/angular-webstorage.js',
            '<%= yeoman.dist %>/bower_components/jquery.browser/dist/jquery.browser.min.js',
            '<%= yeoman.dist %>/bower_components/async/lib/async.js',
            '<%= yeoman.dist %>/bower_components/dialogs/dialogs.min.js',
            '<%= yeoman.dist %>/bower_components/uri.js/src/URI.js',
            '<%= yeoman.dist %>/bower_components/cryptojslib/rollups/hmac-sha1.js',
            '<%= yeoman.dist %>/bower_components/cryptojslib/components/enc-base64-min.js'
          ]
        }
      }
    }
    
  });

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
//    'concat',
    'copy:dist',
//    'cdnify',
    'ngmin',
    'cssmin',
    'uglify',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
  
};
