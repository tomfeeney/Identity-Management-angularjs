'use strict';

describe('Controller: PermissionController', function () {

  // load the controller's module
  beforeEach(module('IdMClientApp'));

  var permissionController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    permissionController = $controller('PermissionController', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
//    expect(scope.awesomeThings.length).toBe(3);
  });
  
});
