'use strict';

var app = angular.module('IdMClientApp', [ 'ui.bootstrap', 'webStorageModule', 'blockUI', 'dialogs.main' ])
.config(function ($httpProvider, $locationProvider) {
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.headers.common['X-CSRF-Token'] = '';
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    if (!($.browser.msie && $.browser.version == '9.0')) {
      $locationProvider.html5Mode(true);
    }
});