'use strict';

describe('Controller: ServiceRoleController', function () {

  // load the controller's module
  beforeEach(module('IdMClientApp'));

  var serviceRoleController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    serviceRoleController = $controller('ServiceRoleController', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
//    expect(scope.awesomeThings.length).toBe(3);
  });
  
});
