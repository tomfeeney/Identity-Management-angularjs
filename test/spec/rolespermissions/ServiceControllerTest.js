'use strict';

describe('Controller: ServiceController', function () {

  // load the controller's module
  beforeEach(module('IdMClientApp'));


  var serviceController, scope, httpBackend, webStorage, utilService;

  var mockServices = {
    "EnterpriseResourceList": {
      "resources": [
        {
          "id": "018aba66-dd5a-11e2-bf0d-e4115b4c35df",
          "name": "hp service"
        },
        {
          "description": "service_creation",
          "id": "0e984f64-9882-11e3-831b-d89d672a6d61",
          "name": "enterpriseService_vicky_1234567"
        },
        {
          "description": "service_creation",
          "id": "2149bf46-987a-11e3-831b-d89d672a6d61",
          "name": "enterpriseService_vicky_46123"
        },
        {
          "description": "Permisson Set Service for MP3.0",
          "id": "35957cf5-8d31-11e3-8cd8-d89d672a6d61",
          "name": "Catalog2"
        },
        {
          "description": "Permisson Set Service for MP3.0",
          "id": "48aedaca-8ab1-11e3-8cd8-d89d672a6d61",
          "name": "Permission Set Service"
        },
        {
          "description": "Permisson Set Service for MP3.0",
          "id": "4e585ee6-8950-11e3-8cd8-d89d672a6d61",
          "name": "Permission Set Service2"
        },
        {
          "description": "service 1 created",
          "id": "7b58f818-b0c9-11e3-bc52-d89d672a6d61",
          "name": "enterpriseService1"
        },
        {
          "id": "8e41238a-1eae-11e3-a812-00059a3c7a00",
          "name": "Google service"
        },
        {
          "description": "service_creation",
          "id": "93d11d3e-a8e1-11e3-a1f1-d89d672a6d61",
          "name": "enterpriseService_vicky_001"
        },
        {
          "id": "994d2ea9-ada8-11e3-b746-d89d672a6d61",
          "name": "lee"
        },
        {
          "description": "service_creation",
          "id": "a52a9466-987a-11e3-831b-d89d672a6d61",
          "name": "enterpriseService_vicky_4612523"
        },
        {
          "description": "service_creation",
          "id": "cbe0287d-a8e1-11e3-a1f1-d89d672a6d61",
          "name": "enterpriseService_vicky_002"
        },
        {
          "description": "service_creation",
          "id": "cd3b37d8-9881-11e3-831b-d89d672a6d61",
          "name": "enterpriseService_vicky_123456"
        },
        {
          "description": "OTA Update Services",
          "id": "d521c0a4-0e9d-11e3-9a4c-12313d06455c",
          "name": "OTA Update Service"
        },
        {
          "description": "App Catalog Service",
          "id": "d54f1a37-c21c-11e2-8187-e4115b4c35df",
          "name": "AC"
        },
        {
          "description": "Enterprise Portal",
          "id": "d556bb58-c21c-11e2-8187-e4115b4c35df",
          "name": "EP"
        },
        {
          "description": "service_creation",
          "id": "d8108524-987a-11e3-831b-d89d672a6d61",
          "name": "enterpriseService_vicky_461852"
        },
        {
          "description": "Permisson Set Service for MP3.0",
          "id": "dce0f6ff-8e08-11e3-8cd8-d89d672a6d61",
          "name": "Permission Set Service26"
        },
        {
          "description": "test",
          "id": "df9f1802-a68a-11e3-b116-d89d672a6d61",
          "name": "love service"
        },
        {
          "id": "e4e1c0d5-1f76-11e3-a812-00059a3c7a00",
          "name": "Facebook service"
        },
        {
          "description": "self",
          "id": "e8d999c5-ab43-11e3-a9cb-d89d672a6d61",
          "name": "self"
        },
        {
          "description": "Permisson Set Service for MP3.0",
          "id": "e949238d-8945-11e3-8cd8-d89d672a6d61",
          "name": "pss2"
        },
        {
          "id": "efbfbd32-29ef-bfbd-4e40-11efbfbdefbf",
          "name": "GF Service"
        },
        {
          "description": "TestDesc",
          "id": "f8e694ab-9a0d-11e3-831b-d89d672a6d61",
          "name": "TestSer4"
        }
      ]
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $httpBackend, $rootScope, $filter, _webStorage_, UtilService, ServiceService) {
    httpBackend = $httpBackend;
    scope = $rootScope.$new();
    webStorage = _webStorage_;
    utilService = UtilService;
    serviceController = $controller('ServiceController', {
      $scope: scope,
      $filter: $filter,
      UtilService: UtilService,
      ServiceService: ServiceService
    });
  }));

  it('should attach a list of services to the scope', function() {

    httpBackend.expectGET('/identitymanagement/services/entpermissionJ/enterprise/resource/service').respond(mockServices);
    spyOn(webStorage, 'get').and.returnValue({ id: '1' });
    // load properly
    scope.initServices();
    httpBackend.flush();
    expect(scope.services.length).toEqual(mockServices.EnterpriseResourceList.resources.length);

    // page properly
    expect(scope.pageServices.length).toEqual(10);

    // order properly
    expect(scope.pageServices[0]).toEqual({ "description": "App Catalog Service", "id": "d54f1a37-c21c-11e2-8187-e4115b4c35df", "name": "AC" });

    // search and order properly
    scope.searchServices('b');
    expect(scope.matchServices.length).toEqual(1);
    expect(scope.pageServices[0]).toEqual({ "id": "e4e1c0d5-1f76-11e3-a812-00059a3c7a00", "name": "Facebook service" });

  });

  it('should be able to add an new service', function() {

    httpBackend.expectPOST('/identitymanagement/services/entpermissionJ/enterprise/resource/service').respond({ Id: { id: 'TestId' } });
    spyOn(webStorage, 'get').and.returnValue({ id: '1' });
    scope.services = [];
    var addedService = {
      "description": "TestDescription",
      "name": "TestName"
    };
    spyOn(utilService, 'showDialog').and.callFake(function() {
      return {
        then: function(callback) {
          callback(addedService); // user input the new service info
        }
      };
    });
    spyOn(utilService, 'notify');

    // add properly
    scope.addService();
    httpBackend.flush();
    expect(utilService.showDialog).toHaveBeenCalled();
    expect(scope.services.length).toEqual(1);
    expect(addedService.id).toEqual('TestId');
    expect(scope.services[0].id).toEqual('TestId');
    expect(utilService.notify).toHaveBeenCalled();

  });

  it('should be able to modify an exist service', function() {

    httpBackend.expectPUT('/identitymanagement/services/entpermissionJ/enterprise/resource/service/TestId').respond({ Id: { id: 'TestId' } });
    spyOn(webStorage, 'get').and.returnValue({ id: '1' });
    scope.services = [{
      "description": "TestDescription",
      "name": "TestName",
      "id": "TestId"
    }];
    var updatedService = {
      "description": "ModifiedDescription",
      "name": "ModifiedName",
      "id": "TestId"
    };
    spyOn(utilService, 'showDialog').and.callFake(function() {
      return {
        then: function(callback) {
          callback(updatedService); // user update the product
        }
      };
    });
    spyOn(utilService, 'notify');

    // update properly
    scope.updateService(scope.services[0]);
    httpBackend.flush();
    expect(utilService.showDialog).toHaveBeenCalled();
    expect(scope.services.length).toEqual(1);
    expect(scope.services[0]).toEqual({
      "description": "ModifiedDescription",
      "name": "ModifiedName",
      "id": "TestId"
    });
    expect(utilService.notify).toHaveBeenCalled();

  });

  it('should be able to delete an exist service', function() {

    httpBackend.expectDELETE('/identitymanagement/services/entpermissionJ/enterprise/resource/service/TestId').respond({ Id: { id: 'TestId' } });
    spyOn(webStorage, 'get').and.returnValue({ id: '1' });
    var deletedService = {
      "description": "TestDescription",
      "name": "TestName",
      "id": "TestId"
    };
    scope.services = [ deletedService ];
    spyOn(utilService, 'confirm').and.callFake(function() {
      return {
        then: function(callback) {
          callback(); // user confirmed the deletion
        }
      };
    });
    spyOn(utilService, 'notify');

    // delete properly
    scope.deleteService(deletedService);
    httpBackend.flush();
    expect(utilService.confirm).toHaveBeenCalled();
    expect(scope.services.length).toEqual(0);
    expect(utilService.notify).toHaveBeenCalled();

  });

});
