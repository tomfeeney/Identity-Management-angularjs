'use strict';

angular.module('IdMClientApp').controller('NavbarController', function ($scope, $location, UserService, webStorage) {


    $scope.getClass = function (path) {
        if ($location.path().substr(0, path.length) == path) {
            return true;
        } else {
            return false;
        }
    };

    $scope.logout = function() {
        $scope.isUserLoggedIn = false;
        UserService.logout();
    };
    
    $scope.showHeaderFooter = function() {
      var user = webStorage.get('user');
      if (!user) {
        return false;
      }
      return true;
    }
    
    $scope.showNavLinks = function() {
      if (webStorage.get('user') != null) {
        if (webStorage.get('accountType') == 'ENTERPRISE_SUPPER_ADMIN_ACCOUNT') {
          $scope.isAdmin = true;
        }
        return true;
      }
      return false;
    };

    $scope.$watch(UserService.isUserLoggedIn, function (isLoggedIn) {
        $scope.user = webStorage.get('user');
        $scope.isUserLoggedIn = isLoggedIn;
        if (!$scope.isUserLoggedIn) {
          $location.path("/login");
        }
    });
    
    $scope.getUserDisplayName = function() {
      var user = webStorage.get('user');
      if (!user) {
        return "";
      }
      if (user.firstName || user.lastName) {
        return [ user.firstName, user.lastName ].join(' ');
      }
      return user.email;
    };


});
