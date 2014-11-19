'use strict';

var app = angular.module('IdMClientApp', ['ngRoute', 'ngResource', 'xeditable', 'checklist-model', 'blockUI', 'ui.keypress', 'ui.bootstrap', 'webStorageModule', 'dialogs.main', 'angular-underscore']);

app.run(function ($rootScope, $location, $timeout, editableOptions, webStorage, ConfigService, UserService, UtilService) {
  
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
  
  // calculate scram here because it's the only place that ConfigService can have the scope information;
  if (webStorage.get('user')) {
    $rootScope.noScram = ConfigService.noScram(webStorage.get('user').idProvider);
  }
  
  var allowAnonymous = function(path, location) {
    if (_.contains(['/login', '/signup', '/passwordreset'], path)) {
      return true;
    }
    return false;
  };
  
  var resolveNextPath = function(nextLocation, defaultPath) {
    var nextPath = nextLocation ? nextLocation.path() : null;
    if (_.isEmpty(nextPath)) {
      if (webStorage.get('isUserLoggedIn') == null) {
        $location.path("/login");
      } else {
        $location.path(defaultPath || '/profile');
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
        $location.path(defaultPath || '/profile');
      }
    }
    $rootScope.$$phase || $rootScope.$apply(); // safe apply
  };
      
  // register listener to watch route changes
  // when user is not logged in, redirect to login page.
  $rootScope.$on("$locationChangeStart", function(event, next, current) {
    var nextLocation = $location.url(next.split("#/")[1]);
    resolveNextPath(nextLocation);
  });
  
  // assign css namespace
  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
    if (current.$$route) {
      $rootScope.bodyClass = current.$$route.bodyClass || current.$$route.originalPath.replace('/', '');
    }
  });
  
})
.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  $httpProvider.defaults.headers.common['X-CSRF-Token'] = '';
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])
.config(function ($routeProvider) {
  
  $routeProvider
    .when('/', {
      redirectTo: '/login'
    })
    .when('/login', {
      templateUrl: '/views/login.html',
      controller: 'UserController'
    })
    .when('/profile', {
      templateUrl: '/views/profile.html',
      controller: 'UserController'
    })
    .when('/account', {
      templateUrl: '/views/account.html',
      controller: 'UserController'
    })
    .when('/passwordreset', {
      templateUrl: '/views/passwordreset.html',
      controller: 'UserController'
    })
    .when('/signup', {
      templateUrl: '/views/signup.html',
      controller: 'UserController'
    })
    .when('/groups', {
      templateUrl: '/views/groups/groups.html',
      controller: 'GroupController'
    })
    .when('/enterprise', {
      templateUrl: '/views/enterprise/enterprise.html',
      controller: 'EnterpriseController'
    })
    .when('/users', {
      templateUrl: '/views/users/users.html',
      controller: 'UserController'
    })
    .when('/roles', {
      templateUrl: '/views/roles/main.html',
      controller: 'RoleMainController'
    })
    .when('/customers', {
      templateUrl: '/views/customerentity/main.html',
      controller: 'CustomerMainController'
    })
    .when('/devices', {
      templateUrl: '/views/devices/devices.html',
      controller: 'DeviceController'
    })
    .when('/tokenGateway', {
      templateUrl: '/views/tokenGateway/main.html',
      controller: 'TokenGatewayMainController'
    })
    .otherwise({
      redirectTo: '/login'
    });
  
});



