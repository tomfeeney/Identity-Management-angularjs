'use strict';

angular.module('IdMClientApp').controller('DeviceController', function ($scope, $filter, UtilService, UserService, DeviceService) {
  
  $scope.initDevices = function() {
    UtilService.showSpinner('Loading devices...');
    $scope.deviceTypes = DeviceService.getDeviceTypes();
    UserService.userAggregate(null, null, function(result) {
      $scope.devices = result.accountDevices || [];
      UtilService.hideSpinner();
//      reloadProducts();
    });
  };
  
  $scope.getDeviceVersion = function(device) {
    return _.compact([ device.osMajor, device.osMinor, device.Revision ]).join('.');
  };
  
  $scope.dissociateDevice = function(device) {
    UtilService.confirm('Do you really want to dissociate the device?', 'Dissociate Device').then(function yes() {
//      UtilService.showSpinner('deleting product...');
//      ProductService.removeProduct(product, function(product) {
//        UtilService.notify('Product successfully deleted.');
//        $scope.products = _.without($scope.products, _.findWhere($scope.products, { id: product.id }));
//        reloadProducts($scope.currentPage);
//      });
    });
  };

});