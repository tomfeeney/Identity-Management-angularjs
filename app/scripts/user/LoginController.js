'use strict';

angular.module('IdMClientApp').controller('LoginController', function ($scope, $location, UtilService, UserService, TokenGatewayService) {

  hello.init({
    google: '214328153726.apps.googleusercontent.com'
  }, { redirect_uri: '' });

  $scope.loginGoogle = function() {
    UtilService.showSpinner("Login");
    hello('google').login(function() {
      UserService.loginOAuth({ response: hello.getAuthResponse('google'), provider: 'google' }, function(accountInfo) {
        if ($scope.WebIdMode) {
          TokenGatewayService.grantAccessAndRedirect($scope.WebIdAuthRequest, accountInfo);
        } else {
          UtilService.hideSpinner();
          $location.path('/profile');
        }
      }, function() {
        UtilService.hideSpinner();
        $location.path('/login');
      });
    });
  };

});
