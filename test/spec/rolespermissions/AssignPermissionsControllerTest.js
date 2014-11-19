'use strict';

describe('Controller: AssignPermissionsController', function () {

  // load the controller's module
  beforeEach(module('IdMClientApp'));

  var assignPermissionsController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    assignPermissionsController = $controller('AssignPermissionsController', {
      $scope: scope,
      $modalInstance: {},
      data: {}
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
//    expect(scope.awesomeThings.length).toBe(3);
  });
  
});
