'use strict';

describe('Controller: AssignServiceRolesController', function () {

  // load the controller's module
  beforeEach(module('IdMClientApp'));

  var assignServiceRolesController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    assignServiceRolesController = $controller('AssignServiceRolesController', {
      $scope: scope,
      $modalInstance: {},
      data: {}
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
//    expect(scope.awesomeThings.length).toBe(3);
  });
  
});
