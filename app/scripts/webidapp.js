'use strict';

var app = angular.module('IdMClientApp', ['ngRoute', 'ngResource', 'blockUI', 'ui.bootstrap', 'webStorageModule', 'dialogs.main', 'angular-underscore']);

app.run(function ($rootScope, $location, $timeout, webStorage, ConfigService, TokenGatewayService, UserService, UtilService) {

  $rootScope.WebIdMode = true;
  // calculate scram here because it's the only place that ConfigService can have the scope information;
  $rootScope.noScram = ConfigService.noScram($location.search().provider);

  webStorage.prefix("webid");
  
  var allowAnonymous = function(path, location) {
    if (_.contains(['/login', '/signup', '/passwordreset', '/terms', '/message', '/changepassword', '/result', '/emailconfirmed', '/authorize'], path)) {
      return true;
    }
    // special case for HP Web ID /profile?token=...&email=...?
    if ('/profile' == path && location.search().token && location.search().email) {
      return true;
    }
    return false;
  };
  
  var resolveNextPath = function(nextLocation, defaultPath) {
    var nextPath = nextLocation ? nextLocation.path() : null;
    // page: {'R', 'P'} where R takes user directly to registration page and P takes user directly to forgot password page.
    if (nextLocation) {
      var page = nextLocation.search().page;
      delete nextLocation.search().page;
      if (page == 'R') $location.path('/signup');
      if (page == 'P') $location.path('/passwordreset');
      if (page) {
        $rootScope.$$phase || $rootScope.$apply(); // safe apply
        return;
      }
    }
    if (_.isEmpty(nextPath)) {
      if (webStorage.get('isUserLoggedIn') == null) {
        $location.path("/login");
      } else {
        $location.path(defaultPath || '/login');
      }
    } else if (webStorage.get('isUserLoggedIn') == null) {
      if (allowAnonymous(nextPath, nextLocation)) {
        // allow these router to go without loggin.
      } else {
        event.preventDefault();
        $location.path("/login");
      }
    } else {
      if (_.contains(['/login'], nextPath)) {
        $location.path(defaultPath || '/login');
      } else {
        allowAnonymous(nextPath, nextLocation);   // call it to set WebIdMode
      }
    }
    $rootScope.$$phase || $rootScope.$apply(); // safe apply
  };
      
  // register listener to watch route changes
  // when user is not logged in, redirect to login page.
  $rootScope.$on("$locationChangeStart", function(event, next, current) {
//    var locale = webStorage.get("locale");
//    if (locale) {
//      $translate.use(locale);
//    }
    var nextLocation = $location.url(next.split("#/")[1]);
    if (nextLocation.search().oauth2_session_key && _.isEmpty($rootScope.WebIdAuthRequest)) {
      $rootScope.WebIdRequest = nextLocation.search();
      TokenGatewayService.getWebIdAuthRequest(nextLocation.search(), function(authRequest) {
        $rootScope.WebIdAuthRequest = authRequest;
        UserService.logout();
        if (_.isEmpty(authRequest)) {
          $location.path('/message').search('message', 'Session has expired. For your data security, this window should be closed.');
          return;
        }
        resolveNextPath(nextLocation, '/login');
      });
      return;
    }
    resolveNextPath(nextLocation);
  });
  
  // assign css namespace
  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
    if (current.$$route) {
      $rootScope.bodyClass = current.$$route.bodyClass || current.$$route.originalPath.replace('/', '');
    }
  });
  
  $(".modal-backdrop").modal('hide');
    
})
.config(function ($httpProvider, $locationProvider) {
    $httpProvider.defaults.useXDomain = true;
    $httpProvider.defaults.headers.common['X-CSRF-Token'] = '';
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
})
.config(function ($routeProvider) {
  
  $routeProvider
    .when('/', {
      redirectTo: '/login'
    })
    .when('/login', {
      templateUrl: '/views/webID/login.html',
      controller: 'UserController'
    })
    .when('/profile', {
      templateUrl: function(params) {
        if (angular.isString(params.mode)) {
          return '/views/webID/' + params.mode + 'profile.html';
        }
        return '/views/webID/profile.html';
      },
      controller: 'ProfileController'
    })
    .when('/passwordreset', {
      templateUrl: '/views/webID/passwordreset.html',
      controller: 'UserController'
    })
    .when('/changepassword', {
      templateUrl: '/views/webID/changepassword.html',
      controller: 'UserController'
    })
    .when('/signup', {
      templateUrl: '/views/webID/signup.html',
      controller: 'UserController'
    })
    .when('/grant', {
      templateUrl: '/views/webID/grant.html',
      controller: 'GrantController'
    })
    .when('/result', {
      templateUrl: '/views/webID/result.html',
      controller: 'GrantController'
    })
    .when('/emailconfirmed', {
      templateUrl: '/views/webID/emailconfirmation.html',
      controller: 'UserController'
    })
    .when('/terms', {
      templateUrl: '/views/webID/terms.html',
      controller: 'UserController'
    })
    .when('/message', {
      templateUrl: '/views/webID/message.html',
      controller: 'MessageController'
    })
    .when('/authorize', {
      templateUrl: '/views/webID/authorize.html',
      controller: 'TokenExchangeController'
    })
    .otherwise({
      redirectTo: '/login'
    });

});



