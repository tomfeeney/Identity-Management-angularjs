'use strict';

describe('Controller: ProductController', function () {

  // load the controller's module
  beforeEach(module('IdMClientApp'));

  var productController, scope, httpBackend, webStorage, utilService;
  
  var mockProducts = {
    "EnterpriseResourceList": {
      "resources": [{
        "id": "0182f235-dd5a-11e2-bf0d-e4115b4c35df",
        "name": "hp product"
      }, {
        "description": "product_creation",
        "id": "0f57ced6-9882-11e3-831b-d89d672a6d61",
        "name": "enterpriseProduct_vicky_1234567"
      }, {
        "description": "",
        "id": "174b8550-a3b5-11e3-9dc5-d89d672a6d61",
        "name": "amytestroleproduct"
      }, {
        "description": "",
        "id": "18728825-a296-11e3-9dc5-d89d672a6d61",
        "name": "CAINTESTDUP1"
      }, {
        "description": "product_creation",
        "id": "220769f8-987a-11e3-831b-d89d672a6d61",
        "name": "enterpriseProduct_vicky_46123"
      }, {
        "description": "",
        "id": "237ae413-a5ca-11e3-be99-d89d672a6d61",
        "name": "qwert"
      }, {
        "description": "",
        "id": "297c9e86-a074-11e3-9dc5-d89d672a6d61",
        "name": "ALLTEST"
      }, {
        "description": "",
        "id": "32e920c3-a5cb-11e3-be99-d89d672a6d61",
        "name": "qwerr"
      }, {
        "description": "OTA Update Product",
        "id": "334c6ba2-0e9c-11e3-9a4c-12313d06455c",
        "name": "OTA Update"
      }, {
        "description": "",
        "id": "38ca418f-a296-11e3-9dc5-d89d672a6d61",
        "name": "CAINTESTDUP2"
      }, {
        "description": "",
        "id": "4450c2ff-a078-11e3-9dc5-d89d672a6d61",
        "name": "aaatest333"
      }, {
        "description": "",
        "id": "4813c9ac-a5ca-11e3-be99-d89d672a6d61",
        "name": "qwere"
      }, {
        "description": "",
        "id": "489a4017-9ac5-11e3-831b-d89d672a6d61",
        "name": "testzxc"
      }, {
        "description": "",
        "id": "54d2e0b9-8e0a-11e3-8cd8-d89d672a6d61",
        "name": "vladProduct"
      }, {
        "description": "",
        "id": "5690ad98-953e-11e3-85fa-d89d672a6d61",
        "name": "testrp"
      }, {
        "description": "",
        "id": "5d88b0e1-9794-11e3-831b-d89d672a6d61",
        "name": "ProdName"
      }, {
        "id": "5fbbb1ce-1eae-11e3-a812-00059a3c7a00",
        "name": "Google product"
      }, {
        "description": "",
        "id": "6903eee1-9883-11e3-831b-d89d672a6d61",
        "name": "edittestd"
      }, {
        "description": "",
        "id": "7c2b705d-9ae0-11e3-88af-d89d672a6d61",
        "name": "AAAAQQ"
      }, {
        "description": "",
        "id": "843ba638-97f5-11e3-831b-d89d672a6d61",
        "name": "test product"
      }, {
        "description": "",
        "id": "8f82ccdd-a5be-11e3-be99-d89d672a6d61",
        "name": "newtestqwprodctn"
      }, {
        "description": "NewDesc",
        "id": "93bdd316-9a02-11e3-831b-d89d672a6d61",
        "name": "NewProduct"
      }, {
        "description": "product_creation",
        "id": "94dc24a0-a8e1-11e3-a1f1-d89d672a6d61",
        "name": "enterpriseProduct_vicky_001"
      }, {
        "description": "",
        "id": "954467ef-9ad0-11e3-88af-d89d672a6d61",
        "name": "testaaa"
      }, {
        "description": "",
        "id": "9757cf87-95aa-11e3-85fa-d89d672a6d61",
        "name": "edittestp"
      }, {
        "description": "",
        "id": "9958b5c8-94a1-11e3-85fa-d89d672a6d61",
        "name": "Testing Production"
      }, {
        "description": "",
        "id": "9b9b87a5-a5bd-11e3-be99-d89d672a6d61",
        "name": "ccc"
      }, {
        "description": "",
        "id": "9cf9e9d1-a5be-11e3-be99-d89d672a6d61",
        "name": "csdcscdsdcs"
      }, {
        "description": "",
        "id": "a32a6b7a-8e0a-11e3-8cd8-d89d672a6d61",
        "name": "vladProduct2"
      }, {
        "description": "product_creation",
        "id": "a5e81808-987a-11e3-831b-d89d672a6d61",
        "name": "enterpriseProduct_vicky_4612523"
      }, {
        "description": "",
        "id": "abfc0189-95b7-11e3-831b-d89d672a6d61",
        "name": "sameer3"
      }, {
        "description": "",
        "id": "ae8aea07-9592-11e3-85fa-d89d672a6d61",
        "name": "ProdTest"
      }, {
        "description": "",
        "id": "b1c07362-9f95-11e3-9dc5-d89d672a6d61",
        "name": "CAINPRODUCT"
      }, {
        "description": "",
        "id": "b72fa93b-a5be-11e3-be99-d89d672a6d61",
        "name": "sdfwerferfr"
      }, {
        "description": "",
        "id": "bb39afd9-8e73-11e3-8cd8-d89d672a6d61",
        "name": "testing product"
      }, {
        "description": "",
        "id": "bc66506c-94b5-11e3-85fa-d89d672a6d61",
        "name": "Test"
      }, {
        "description": "",
        "id": "c1d8825c-a508-11e3-96ea-d89d672a6d61",
        "name": "R-testss"
      }, {
        "description": "",
        "id": "c268506b-8e0a-11e3-8cd8-d89d672a6d61",
        "name": "Catalog"
      }, {
        "description": "",
        "id": "c44c2b33-9ea7-11e3-922c-d89d672a6d61",
        "name": "CAIN PRODUCT"
      }, {
        "description": "",
        "id": "c8901ff0-95b3-11e3-831b-d89d672a6d61",
        "name": "EDIT1"
      }, {
        "description": "test",
        "id": "cae527b1-a68a-11e3-b116-d89d672a6d61",
        "name": "love product"
      }, {
        "description": "",
        "id": "cd480017-8add-11e3-8cd8-d89d672a6d61",
        "name": "Catalog2"
      }, {
        "description": "product_creation",
        "id": "cdc981ef-a8e1-11e3-a1f1-d89d672a6d61",
        "name": "enterpriseProduct_vicky_002"
      }, {
        "description": "product_creation",
        "id": "cdd2e3fa-9881-11e3-831b-d89d672a6d61",
        "name": "enterpriseProduct_vicky_123456"
      }, {
        "description": "Banana Bread Project is the product",
        "id": "d546dcd6-c21c-11e2-8187-e4115b4c35df",
        "name": "Banana Bread"
      }, {
        "description": "self",
        "id": "d6920902-ab43-11e3-a9cb-d89d672a6d61",
        "name": "self"
      }, {
        "description": "product_creation",
        "id": "d8cd6c86-987a-11e3-831b-d89d672a6d61",
        "name": "enterpriseProduct_vicky_461852"
      }, {
        "description": "",
        "id": "daec7423-991c-11e3-831b-d89d672a6d61",
        "name": "Caprica"
      }, {
        "description": "",
        "id": "e1916190-a5bd-11e3-be99-d89d672a6d61",
        "name": "qwer"
      }, {
        "id": "e35e9137-1f76-11e3-a812-00059a3c7a00",
        "name": "Facebook product"
      }, {
        "description": "",
        "id": "e445da26-9ac3-11e3-831b-d89d672a6d61",
        "name": "edittestpw"
      }, {
        "description": "",
        "id": "e4770d3a-954b-11e3-85fa-d89d672a6d61",
        "name": "CainTestProduct"
      }, {
        "description": "",
        "id": "e64b04e7-9ea7-11e3-922c-d89d672a6d61",
        "name": "CAINTESTDUP"
      }, {
        "description": "",
        "id": "e987cd70-95b4-11e3-831b-d89d672a6d61",
        "name": "sameer"
      }, {
        "id": "efbfbd32-29ef-bfbd-4e40-11efbfbdefbf",
        "name": "GF Product"
      }]
    }
  };
  
  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $httpBackend, $rootScope, $filter, _webStorage_, UtilService, ProductService) {
    httpBackend = $httpBackend;
    scope = $rootScope.$new();
    webStorage = _webStorage_;
    utilService = UtilService;
    productController = $controller('ProductController', {
      $scope: scope,
      $filter: $filter,
      UtilService: UtilService,
      ProductService: ProductService
    });
  }));

  it('should attach a list of products to the scope', function() {
    
    httpBackend.expectGET('/identitymanagement/services/entpermissionJ/enterprise/resource/products').respond(mockProducts);
    spyOn(webStorage, 'get').and.returnValue({ id: '1' });
    
    // load properly
    scope.initProducts();
    httpBackend.flush();
    expect(scope.products.length).toEqual(mockProducts.EnterpriseResourceList.resources.length);
    
    // page properly
    expect(scope.pageProducts.length).toEqual(10);
    
    // order properly
    expect(scope.pageProducts[0]).toEqual({ "description": "", "id": "7c2b705d-9ae0-11e3-88af-d89d672a6d61", "name": "AAAAQQ" });
    
    // search and order properly
    scope.searchProducts('b');
    expect(scope.matchProducts.length).toEqual(2);
    expect(scope.pageProducts[0]).toEqual({ "description": "Banana Bread Project is the product", "id": "d546dcd6-c21c-11e2-8187-e4115b4c35df", "name": "Banana Bread" });
    
  });
  
  it('should be able to add an new product', function() {
    
    httpBackend.expectPOST('/identitymanagement/services/entpermissionJ/enterprise/resource/product').respond({ Id: { id: 'TestId' } });
    spyOn(webStorage, 'get').and.returnValue({ id: '1' });
    scope.products = [];
    var addedProduct = {
      "description": "TestDescription",
      "name": "TestName"
    };
    spyOn(utilService, 'showDialog').and.callFake(function() {
      return {
        then: function(callback) {
          callback(addedProduct); // user input the new product info
        }
      };
    });
    spyOn(utilService, 'notify');
    
    // add properly
    scope.addProduct();
    httpBackend.flush();
    expect(utilService.showDialog).toHaveBeenCalled();
    expect(scope.products.length).toEqual(1);
    expect(addedProduct.id).toEqual('TestId');
    expect(scope.products[0].id).toEqual('TestId');
    expect(utilService.notify).toHaveBeenCalled();
    
  });
  
  it('should be able to modify an exist product', function() {
    
    httpBackend.expectPUT('/identitymanagement/services/entpermissionJ/enterprise/resource/product/TestId').respond({ Id: { id: 'TestId' } });
    spyOn(webStorage, 'get').and.returnValue({ id: '1' });
    scope.products = [{
      "description": "TestDescription",
      "name": "TestName",
      "id": "TestId"
    }];
    var updatedProduct = {
      "description": "ModifiedDescription",
      "name": "ModifiedName",
      "id": "TestId"
    };
    spyOn(utilService, 'showDialog').and.callFake(function() {
      return {
        then: function(callback) {
          callback(updatedProduct); // user update the product
        }
      };
    });
    spyOn(utilService, 'notify');
    
    // update properly
    scope.updateProduct(scope.products[0]);
    httpBackend.flush();
    expect(utilService.showDialog).toHaveBeenCalled();
    expect(scope.products.length).toEqual(1);
    expect(scope.products[0]).toEqual({
      "description": "ModifiedDescription",
      "name": "ModifiedName",
      "id": "TestId"
    });
    expect(utilService.notify).toHaveBeenCalled();
    
  });
  
  it('should be able to delete an exist product', function() {
    
    httpBackend.expectDELETE('/identitymanagement/services/entpermissionJ/enterprise/resource/product/TestId').respond({ Id: { id: 'TestId' } });
    spyOn(webStorage, 'get').and.returnValue({ id: '1' });
    var deletedProduct = {
      "description": "TestDescription",
      "name": "TestName",
      "id": "TestId"
    };
    scope.products = [ deletedProduct ];
    spyOn(utilService, 'confirm').and.callFake(function() {
      return {
        then: function(callback) {
          callback(); // user confirmed the deletion
        }
      };
    });
    spyOn(utilService, 'notify');
    
    // delete properly
    scope.deleteProduct(deletedProduct);
    httpBackend.flush();
    expect(utilService.confirm).toHaveBeenCalled();
    expect(scope.products.length).toEqual(0);
    expect(utilService.notify).toHaveBeenCalled();
    
  });
  
});
