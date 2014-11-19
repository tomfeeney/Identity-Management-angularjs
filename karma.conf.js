// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  
  config.set({
    
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'app/3rd_vendors/js/csspopup.js',
      'app/bower_components/jquery/jquery.js',
      'app/bower_components/jquery-ui/ui/jquery-ui.js',
      'app/bower_components/jquery.browser/dist/jquery.browser.js',
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/underscore/underscore.js',
      'app/bower_components/angular-block-ui/angular-block-ui.js',
      'app/bower_components/async/lib/async.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-webstorage/angular-webstorage.js',
      'app/bower_components/angular-underscore/angular-underscore.js',
      'app/bower_components/angular-checklist-model/checklist-model.js',
      'app/bower_components/bootstrap/dist/js/bootstrap.min.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'app/bower_components/angular-xeditable/dist/js/xeditable.js',
      'app/bower_components/dialogs/dialogs.js',
      'app/bower_components/cryptojslib/rollups/pbkdf2.js',
      'app/bower_components/cryptojslib/components/enc-base64-min.js',
      'app/bower_components/hello/dist/hello.all.js',
      'app/scripts/app.js',
      'app/scripts/**/*.js',
      'app/config/config.js',
      'test/mock/**/*.js',
      'test/spec/**/*.js'
    ],

    // list of files / patterns to exclude
    exclude: [ 
      'app/scripts/webidapp.js',
      'app/scripts/authorizeapp.js'
    ],
    
    reporters: ['progress', 'coverage'],
    
    preprocessors: {
      'app/scripts/**/*.js': 'coverage'
    },

    // web server port
    port: 10200,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
    
  });
  
};
