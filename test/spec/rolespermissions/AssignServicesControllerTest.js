'use strict';

describe('Controller: AssignServicesController', function () {

  // load the controller's module
  beforeEach(module('IdMClientApp'));

  var assignServicesController, scope, httpBackend, mockModalInstance, mockData, utilService, productService, serviceService, webStorage;
  
  var mockServices = {
    "resources": [{
      "id": "018aba66-dd5a-11e2-bf0d-e4115b4c35df",
      "name": "hp service"
    }, {
      "description": "service_creation",
      "id": "0e984f64-9882-11e3-831b-d89d672a6d61",
      "name": "enterpriseService_vicky_1234567"
    }, {
      "description": "service_creation",
      "id": "2149bf46-987a-11e3-831b-d89d672a6d61",
      "name": "enterpriseService_vicky_46123"
    }, {
      "description": "Permisson Set Service for MP3.0",
      "id": "35957cf5-8d31-11e3-8cd8-d89d672a6d61",
      "name": "Catalog2"
    }, {
      "description": "Permisson Set Service for MP3.0",
      "id": "48aedaca-8ab1-11e3-8cd8-d89d672a6d61",
      "name": "Permission Set Service"
    }, {
      "description": "Permisson Set Service for MP3.0",
      "id": "4e585ee6-8950-11e3-8cd8-d89d672a6d61",
      "name": "Permission Set Service2"
    }, {
      "id": "8e41238a-1eae-11e3-a812-00059a3c7a00",
      "name": "Google service"
    }, {
      "description": "service_creation",
      "id": "93d11d3e-a8e1-11e3-a1f1-d89d672a6d61",
      "name": "enterpriseService_vicky_001"
    }, {
      "id": "994d2ea9-ada8-11e3-b746-d89d672a6d61",
      "name": "lee"
    }, {
      "description": "service_creation",
      "id": "a52a9466-987a-11e3-831b-d89d672a6d61",
      "name": "enterpriseService_vicky_4612523"
    }, {
      "description": "service_creation",
      "id": "cbe0287d-a8e1-11e3-a1f1-d89d672a6d61",
      "name": "enterpriseService_vicky_002"
    }, {
      "description": "service_creation",
      "id": "cd3b37d8-9881-11e3-831b-d89d672a6d61",
      "name": "enterpriseService_vicky_123456"
    }, {
      "description": "OTA Update Services",
      "id": "d521c0a4-0e9d-11e3-9a4c-12313d06455c",
      "name": "OTA Update Service"
    }, {
      "description": "App Catalog Service",
      "id": "d54f1a37-c21c-11e2-8187-e4115b4c35df",
      "name": "AC"
    }, {
      "description": "Enterprise Portal",
      "id": "d556bb58-c21c-11e2-8187-e4115b4c35df",
      "name": "EP"
    }, {
      "description": "service_creation",
      "id": "d8108524-987a-11e3-831b-d89d672a6d61",
      "name": "enterpriseService_vicky_461852"
    }, {
      "description": "Permisson Set Service for MP3.0",
      "id": "dce0f6ff-8e08-11e3-8cd8-d89d672a6d61",
      "name": "Permission Set Service26"
    }, {
      "description": "test",
      "id": "df9f1802-a68a-11e3-b116-d89d672a6d61",
      "name": "love service"
    }, {
      "id": "e4e1c0d5-1f76-11e3-a812-00059a3c7a00",
      "name": "Facebook service"
    }, {
      "description": "self",
      "id": "e8d999c5-ab43-11e3-a9cb-d89d672a6d61",
      "name": "self"
    }, {
      "description": "Permisson Set Service for MP3.0",
      "id": "e949238d-8945-11e3-8cd8-d89d672a6d61",
      "name": "pss2"
    }, {
      "id": "efbfbd32-29ef-bfbd-4e40-11efbfbdefbf",
      "name": "GF Service"
    }, {
      "description": "TestDesc",
      "id": "f8e694ab-9a0d-11e3-831b-d89d672a6d61",
      "name": "TestSer4"
    }]
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $httpBackend, $rootScope, UtilService, _webStorage_, ProductService, ServiceService) {
    mockModalInstance = {
        close: function () {}
    };
    mockData = {description: "", id: "productId", name: "productName"};

    httpBackend = $httpBackend;
    utilService = UtilService;
    webStorage = _webStorage_;
    productService = ProductService;
    serviceService = ServiceService;
    scope = $rootScope.$new();
    assignServicesController = $controller('AssignServicesController', {
      $scope: scope,
      $modalInstance: mockModalInstance,  
      data: mockData, 
      UtilService: UtilService, 
      ProductService: ProductService,
      ServiceService: ServiceService
    });
  }));

  it('should attach a list of services to the scope', function (done) {
    var mockAssignedServices = { "resources": [ mockServices.resources[0] ] };
    spyOn(utilService, 'showSpinner');
    spyOn(serviceService, 'getServices').and.callFake(function(onSuccess) {
      onSuccess(mockServices);
    });
    spyOn(productService, 'getProductServices').and.callFake(function(product, onSuccess) {
      onSuccess(mockAssignedServices);
    });
    scope.initDialog(function() {
      expect(scope.availableServices.length).toEqual(mockServices.resources.length - mockAssignedServices.resources.length);
      expect(scope.assignedServices.length).toEqual(mockAssignedServices.resources.length);
      expect(scope.data.toBeAssignedServices.length).toEqual(0);
      expect(scope.data.toBeRemovedServices.length).toEqual(0);
      done();
    });
  });

  it('should be able to add/remove services correctly', function () {
    scope.availableServices = mockServices.resources;
    scope.assignedServices = [];

    scope.data.toBeAssignedServices = [mockServices.resources[0]];
    scope.data.toBeRemovedServices = [];
    scope.addServices();
    expect(scope.availableServices.length).toEqual(22);
    expect(scope.assignedServices.length).toEqual(1);
    expect(scope.data.toBeAssignedServices.length).toEqual(0);
    expect(scope.data.toBeRemovedServices.length).toEqual(0);

    scope.data.toBeRemovedServices = scope.assignedServices;
    scope.removeServices();
    expect(scope.availableServices.length).toEqual(23);
    expect(scope.assignedServices.length).toEqual(0);
    expect(scope.data.toBeAssignedServices.length).toEqual(0);
    expect(scope.data.toBeRemovedServices.length).toEqual(0);

  });

  
  it('should be able to save', function () {
    spyOn(utilService, 'showSpinner');
    spyOn(mockModalInstance, 'close');
    spyOn(webStorage, 'get').and.returnValue({id:'id'});
    spyOn(utilService, 'getToken').and.returnValue('token');
    httpBackend.expectPOST('/identitymanagement/services/entpermissionJ/enterprise/resource/product/productId/service').respond({
      EnterpriseResourceActResult: {
        productId: "productId"
      }
    });

    scope.assignedServiceIds = [];
    scope.assignedServices = [{id:'serviceId',name:'test'}];
    scope.save();
    httpBackend.flush();
    expect(mockModalInstance.close).toHaveBeenCalled();

    httpBackend.expectDELETE('/identitymanagement/services/entpermissionJ/enterprise/resource/product/productId/service').respond({
      EnterpriseResourceActResult: {
        productId: "productId"
      }
    });
    scope.assignedServiceIds = ['serviceId'];
    scope.assignedServices = [];
    scope.save();
    httpBackend.flush();
    expect(mockModalInstance.close).toHaveBeenCalled();

  });
  
  it('should be able to handle save failure', function () {
    spyOn(utilService, 'showSpinner');
    spyOn(utilService, 'lnotify');
    spyOn(webStorage, 'get').and.returnValue({id:'id'});
    spyOn(utilService, 'getToken').and.returnValue('token');

    spyOn(scope, 'initDialog');

    httpBackend.expectPOST('/identitymanagement/services/entpermissionJ/enterprise/resource/product/productId/service').respond({
      EnterpriseResourceActResult: {
        failed: [
          {errorMessage: 'The relationship between product 14de5e77-af09-11e2-bf07-e4115b4c35df and service f0e5876c-af1e-11e2-b541-e4115b4c35df already exists'}
        ]
      }
    });
    scope.assignedServiceIds = [];
    scope.assignedServices = [{id:'serviceId',name:'test'}];
    scope.save();
    httpBackend.flush();
    expect(utilService.lnotify).toHaveBeenCalled();
    expect(scope.initDialog).toHaveBeenCalled();
  });

});
