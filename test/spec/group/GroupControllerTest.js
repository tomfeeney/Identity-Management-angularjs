'use strict';

describe('Controller: GroupController', function () {

  // load the controller's module
  beforeEach(module('IdMClientApp'));

  var groupController, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    groupController = $controller('GroupController', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
//    expect(scope.awesomeThings.length).toBe(3);
  });
});
