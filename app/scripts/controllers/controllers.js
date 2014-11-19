'use strict';

angular.module('IdMClientApp').controller('MessageController', function ($scope, $location) {
  
  $scope.initMessage = function() {
    $scope.message = $location.search().message || 'Unknown message';
    delete $location.search().message;
  };
  
});