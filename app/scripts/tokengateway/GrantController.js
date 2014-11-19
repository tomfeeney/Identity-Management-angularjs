'use strict';

angular.module('IdMClientApp').controller('GrantController', function ($scope, $location, $window, webStorage, UtilService, TokenGatewayService, WebIdService) {
  
  var authRequest = $scope.WebIdAuthRequest;
  var accountInfo = webStorage.get('accountInfo');

  $scope.initGrant = function() {
    async.waterfall([
      function(next) {
        // Step 1: check if by default granted.
        TokenGatewayService.getAuthGranted(authRequest, function(granted) {
          if (granted) {
            $scope.grantAccess();
            return;
          }
          next(null, granted);
        });
      }, function(granted, next) {
        // Step 2: prepare grant page
        UtilService.showSpinner();
        TokenGatewayService.getAuthFormData(authRequest, function(authformdata) {
          $scope.authformdata = authformdata;
          UtilService.hideSpinner();
        });
      }]
    );
  };
  
  $scope.initResult = function() {
    UtilService.hideSpinner();
    $scope.result = WebIdService.gettingToken(authRequest) ? angular.copy(UtilService.queryToJson($location.hash())) : angular.copy($location.search());
    var title = 'HP WebID';
    angular.forEach($scope.result, function(v, k) { title += ' ' + [k, v].join('='); });
    $window.document.title = title;
  };
  
  $scope.grantAccess = function() {
    TokenGatewayService.grantAccessAndRedirect(authRequest, accountInfo);
  };
  
  $scope.denyAccess = function() {
    TokenGatewayService.denyAccessAndRedirect(authRequest);
  };
  
});