'use strict';

angular.module('IdMClientApp').controller('EnterpriseController', function ($scope, UtilService, EnterpriseService) {
  
  $scope.initPage = function () {
    UtilService.showSpinner('Loading enterprise information...');
    EnterpriseService.getCurrentEnterprise(function(enterprise) {
      $scope.enterprise = enterprise;
      UtilService.hideSpinner();
    });
  };
  
});
