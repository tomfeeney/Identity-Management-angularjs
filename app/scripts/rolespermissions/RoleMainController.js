'use strict';

angular.module('IdMClientApp').controller('RoleMainController', function ($scope, $filter) {
  
  $scope.initPage = function() {
    $scope.templatePath = '/views/roles/products.html';
  };
  
  $scope.selectTab = function(tab) {
    $scope.templatePath = '/views/roles/' + tab + '.html';
  };
  
})
.controller('ProductController', function ($scope, $filter, UtilService, ProductService) {

  $scope.initProducts = function() {
    UtilService.showSpinner('Loading products...');
    $scope.products = [];
    ProductService.getProducts(function(result) {
      $scope.products = result.resources;
      reloadProducts();
    });
  };

  var reloadProducts = function(currentPage) {
    $scope.products = $filter('orderBy')($scope.products, UtilService.stringGetter('name'));
    $scope.searchProducts($scope.productCriteria);
    $scope.setProductPage(currentPage || 1);
    UtilService.hideSpinner();
  };

  $scope.searchProducts = function(productCriteria) {
    $scope.productCriteria = productCriteria;
    $scope.matchProducts = $filter('filter')($scope.products, UtilService.stringComparator(productCriteria, 'name'));
    $scope.setProductPage(1);
  };

  $scope.setProductPage = function (pageNo) {
    $scope.currentPage = pageNo;
    $scope.pageProducts = $scope.setPage(pageNo, $scope.matchProducts);
  };

  $scope.addProduct = function () {
    UtilService.showDialog('views/roles/product-dlg.html').then(function (product) {
      UtilService.showSpinner('Adding product...');
      ProductService.createProduct(product, function(product) {
        UtilService.notify('Product successfully added.');
        $scope.products.push(product);
        reloadProducts($scope.currentPage);
      });
    });
  };

  $scope.updateProduct = function (product) {
    product.title = 'Update Product';
    UtilService.showDialog('views/roles/product-dlg.html', product).then(function(updatedProduct) {
      UtilService.showSpinner('Updating product...');
      ProductService.updateProduct(updatedProduct, function(updatedProduct) {
        UtilService.notify('Product successfully updated.');
        angular.copy(updatedProduct, product);
        reloadProducts($scope.currentPage);
      });
    });
  };

  $scope.deleteProduct = function(product) {
    UtilService.confirm('Do you really want to delete the product?', 'Delete Product').then(function yes() {
      UtilService.showSpinner('deleting product...');
      ProductService.removeProduct(product, function(product) {
        UtilService.notify('Product successfully deleted.');
        $scope.products = _.without($scope.products, _.findWhere($scope.products, { id: product.id }));
        reloadProducts($scope.currentPage);
      });
    });
  };

  $scope.assignServices = function(product) {
    $scope.selectedProduct = product;
    UtilService.showDialog('views/roles/product-service-dlg.html', product, 'AssignServicesController').then(function(result) {
      UtilService.notify("Add/Remove Service(s) operation successfully completed.");
    });
  };


})
.controller('ServiceController', function ($scope, $filter, UtilService, ServiceService) {

  $scope.initServices = function() {
    UtilService.showSpinner('Loading services...');
    $scope.services = [];
    ServiceService.getServices(function(result) {
      $scope.services = result.resources;
      reloadServices();
    });
  };

  var reloadServices = function(currentPage) {
    $scope.services = $filter('orderBy')($scope.services, UtilService.stringGetter('name'));
    $scope.searchServices($scope.serviceCriteria);
    $scope.setServicePage(currentPage || 1);
    UtilService.hideSpinner();
  };

  $scope.searchServices = function(serviceCriteria) {
    $scope.serviceCriteria = serviceCriteria;
    $scope.matchServices = $filter('filter')($scope.services, UtilService.stringComparator(serviceCriteria, 'name'));
    $scope.setServicePage(1);
  };

  $scope.setServicePage = function(pageNo) {
    $scope.currentPage = pageNo;
    $scope.pageServices = $scope.setPage(pageNo, $scope.matchServices);
  };

  $scope.addService = function() {
    UtilService.showDialog('views/roles/service-dlg.html').then(function(service) {
      UtilService.showSpinner('Adding service...');
      ServiceService.createService(service, function(service) {
        UtilService.notify('Service successfully added.');
        $scope.services.push(service);
        reloadServices($scope.currentPage);
      });
    });
  };

  $scope.updateService = function(service) {
    service.title = 'Update Service';
    UtilService.showDialog('views/roles/service-dlg.html', service).then(function(updatedService) {
      UtilService.showSpinner('updating service...');
      ServiceService.updateService(updatedService, function(updatedService) {
        UtilService.notify('Service successfully updated.');
        angular.copy(updatedService, service);
        reloadServices($scope.currentPage);
      });
    });
  };

  $scope.deleteService = function(service) {
    UtilService.confirm('Do you really want to delete the service?', 'Delete Service').then(function yes() {
      UtilService.showSpinner('deleting service...');
      ServiceService.removeService(service, function(service) {
        UtilService.notify('Service successfully deleted.');
        $scope.services = _.without($scope.services, _.findWhere($scope.services, { id: service.id }));
        reloadServices($scope.currentPage);
      });
    });
  };

})
.controller('ProductRoleController', function ($scope, $filter, UtilService, ProductService, RoleService) {

  $scope.initProductRoles = function() {
    UtilService.showSpinner('Loading products...');
    $scope.products = [];
    // load all products
    ProductService.getProducts(function(result) {
      $scope.products = result.resources;
      UtilService.hideSpinner();
    });
  };

  $scope.loadProductRoles = function(onSuccess) {
    UtilService.showSpinner('Loading product roles...');
    $scope.productRoles = [];
    $scope.productRoleCriteria = '';
    if (!$scope.selectedProduct) {
      reloadProductRoles();
      return;
    }
    RoleService.getProductRoles($scope.selectedProduct, function(result) {
      $scope.productRoles = result.lists || [];
      reloadProductRoles();
      $scope.$$phase || $scope.$apply(); // safe apply
    });
  };

  var reloadProductRoles = function(currentPage) {
    $scope.productRoles = $filter('orderBy')($scope.productRoles, UtilService.stringGetter(function (role) { return role.role.name; }));
    $scope.searchProductRoles($scope.productRoleCriteria);
    $scope.setProductRolePage(currentPage || 1);
    UtilService.hideSpinner();
  };

  $scope.searchProductRoles = function(productRoleCriteria) {
    $scope.productRoleCriteria = productRoleCriteria;
    $scope.matchProductRoles = $filter('filter')($scope.productRoles, UtilService.stringComparator(productRoleCriteria, function(role) { return role.role.name; }));
    $scope.setProductRolePage(1);
  };

  $scope.setProductRolePage = function(pageNo) {
    $scope.currentPage = pageNo;
    $scope.pageProductRoles = $scope.setPage(pageNo, $scope.matchProductRoles);
  };

  $scope.addProductRole = function() {
    var role = {
      product: $scope.selectedProduct,
      productId: $scope.selectedProduct.id,
      role: {} };
    UtilService.showDialog('views/roles/productRole-dlg.html', role).then(function(role) {
      UtilService.showSpinner('Adding product role...');
      RoleService.createProductRole(role, function(productRole) {
        UtilService.notify('Product role successfully added.');
        $scope.productRoles.push(productRole);
        reloadProductRoles($scope.currentPage);
      });
    });
  };

  $scope.updateProductRole = function(productRole) {
    productRole.title = 'Update Product Role';
    productRole.product = $scope.selectedProduct;
    UtilService.showDialog('views/roles/productRole-dlg.html', productRole).then(function(updatedProductRole) {
      UtilService.showSpinner('Updating product role...');
      RoleService.updateProductRole(updatedProductRole, function (updatedProductRole) {
        UtilService.notify('Product role successfully updated.');
        angular.copy(updatedProductRole, productRole);
        reloadProductRoles($scope.currentPage);
      });
    });
  };

  $scope.deleteProductRole = function(productRole) {
    UtilService.confirm('Do you really want to delete the product role?', 'Delete Product Role').then(function yes() {
      UtilService.showSpinner('Deleting product role...');
      RoleService.removeProductRole(productRole, function(productRole) {
        UtilService.notify('Product role successfully deleted.');
        $scope.productRoles = _.without($scope.productRoles, productRole);
        reloadProductRoles($scope.currentPage);
      });
    });
  };

  $scope.assignServiceRoles = function(productRole) {
    UtilService.showDialog('views/roles/productRole-serviceRole-dlg.html', productRole, 'AssignServiceRolesController').then(function(productRole) {
      UtilService.notify("Add/Remove Role(s) operation successfully completed.");
    });
  };

})
.controller('ServiceRoleController', function ($scope, $filter, UtilService, RoleService, ServiceService, PermissionService) {

  $scope.initServiceRoles = function() {
      // load all services
      UtilService.showSpinner('Loading services...');
      $scope.services = [];
      ServiceService.getServices(function(result) {
        $scope.services = result.resources;
        UtilService.hideSpinner();
      });
  };

  $scope.loadServiceRoles = function(onSuccess) {
    UtilService.showSpinner('Loading service roles...');
    $scope.serviceRoles = [];
    $scope.serviceRoleCriteria = '';
    if (!$scope.selectedService) {
      reloadServiceRoles();
      return;
    }
    RoleService.getServiceRoles($scope.selectedService, function(result) {
      $scope.serviceRoles = result.lists;
      reloadServiceRoles();
      $scope.$$phase || $scope.$apply(); // safe apply
    });
  };

  var reloadServiceRoles = function(currentPage) {
    $scope.serviceRoles = $filter('orderBy')($scope.serviceRoles, UtilService.stringGetter(function (role) { return role.role.name }));
    $scope.searchServiceRoles($scope.serviceRoleCriteria);
    $scope.setServiceRolePage(currentPage || 1);
    UtilService.hideSpinner();
  };

  $scope.searchServiceRoles = function(serviceRoleCriteria) {
    $scope.serviceRoleCriteria = serviceRoleCriteria;
    $scope.matchServiceRoles = $filter('filter')($scope.serviceRoles, UtilService.stringComparator(serviceRoleCriteria, function(role) { return role.role.name; }));
    $scope.setServiceRolePage(1);
  };

  $scope.setServiceRolePage = function(pageNo) {
    $scope.currentPage = pageNo;
    $scope.pageServiceRoles = $scope.setPage(pageNo, $scope.matchServiceRoles);
  };

  $scope.addServiceRole = function() {
    var role = {
      service: $scope.selectedService,
      serviceId: $scope.selectedService.id,
      role: {} };
    UtilService.showDialog('views/roles/serviceRole-dlg.html', role).then(function(role) {
      UtilService.showSpinner('Adding service role...');
      RoleService.createServiceRole(role, function(serviceRole) {
        UtilService.notify('Service role successfully added.');
        $scope.serviceRoles.push(serviceRole);
        reloadServiceRoles($scope.currentPage);
      });
    });
  };

  $scope.updateServiceRole = function(serviceRole) {
    serviceRole.title = 'Update Service Role';
    serviceRole.service = $scope.selectedService;
    UtilService.showDialog('views/roles/serviceRole-dlg.html', serviceRole).then(function(updatedServiceRole) {
      UtilService.showSpinner('Updating service role...');
      RoleService.updateServiceRole(updatedServiceRole, function (updatedServiceRole) {
        UtilService.notify('Service role successfully updated.');
        angular.copy(updatedServiceRole, serviceRole);
        reloadServiceRoles($scope.currentPage);
      });

    });
  };

  $scope.deleteServiceRole = function(serviceRole) {
    UtilService.confirm('Do you really want to delete the service role?', 'Delete Service Role').then(function () {
      UtilService.showSpinner('Deleting service role...');
      RoleService.removeServiceRole(serviceRole, function(service) {
        UtilService.notify('Service role successfully deleted.');
        $scope.serviceRoles = _.without($scope.serviceRoles, service);
        reloadServiceRoles($scope.currentPage);
      });
    });
  };

  $scope.assignPermissions = function(serviceRole) {
    UtilService.showDialog('views/roles/serviceRole-permission-dlg.html', serviceRole, 'AssignPermissionsController').then(function(serviceRole) {
      UtilService.notify("Add/Remove Permission(s) operation successfully completed.");
    });
  };

})
.controller('PermissionController', function ($scope, $filter, UtilService, PermissionService) {

  $scope.initPermissions = function() {
    UtilService.showSpinner('Loading permissions...');
    $scope.permissions = [];
    PermissionService.getPermissions(function(result) {
      $scope.permissions = result.lists;
      reloadPermissions();
    });
  };

  var reloadPermissions = function(currentPage) {
    $scope.permissions = $filter('orderBy')($scope.permissions, UtilService.stringGetter('endpoint'));
    $scope.searchPermissions($scope.permissionCriteria);
    $scope.setPermissionPage(currentPage || 1);
    UtilService.hideSpinner();
  };

  $scope.searchPermissions = function(permissionCriteria) {
    $scope.permissionCriteria = permissionCriteria;
    $scope.matchPermissions = $filter('filter')($scope.permissions, UtilService.stringComparator(permissionCriteria, 'endpoint'));
    $scope.setPermissionPage(1);
  };

  $scope.setPermissionPage = function(pageNo) {
    $scope.currentPage = pageNo;
    $scope.pagePermissions = $scope.setPage(pageNo, $scope.matchPermissions);
  };

  $scope.addPermission = function() {
    UtilService.showDialog('views/roles/permission-dlg.html').then(function(permission) {
      UtilService.showSpinner('Adding permission...');
      PermissionService.createPermission(permission, function(permission) {
        UtilService.notify('Permission successfully added.');
        $scope.permissions.push(permission);
        reloadPermissions($scope.currentPage);
      });
    });
  };

  $scope.updatePermission = function(permission) {
    permission.title = 'Update Permission';
    UtilService.showDialog('views/roles/permission-dlg.html', permission).then(function(updatedPermission) {
      UtilService.showSpinner('Updating permission...');
      PermissionService.updatePermission(updatedPermission, function(updatedPermission) {
        UtilService.notify('Permission successfully updated.');
        angular.copy(updatedPermission, permission);
        reloadPermissions($scope.currentPage);
      });
    });
  };

  $scope.deletePermission = function(permission) {
    UtilService.confirm('Do you really want to delete the permission?', 'Delete Permission').then(function yes() {
      UtilService.showSpinner('Deleting permission...');
      PermissionService.removePermission(permission, function(permission) {
        UtilService.notify('Permission successfully deleted.');
        $scope.permissions = _.without($scope.permissions, _.findWhere($scope.permissions, { id: permission.id }));
        reloadPermissions($scope.currentPage);
      });
    });
  };

})
.controller('AssignServicesController', function ($scope, $modalInstance, data, UtilService, ProductService, ServiceService) {
  $scope.data = data || {};
  var product = $scope.data;

  $scope.cancel = function() {
    $modalInstance.dismiss('canceled');
  };

  $scope.save = function() {
    UtilService.showSpinner('Maintaining services...');
    var serviceIdChosen = _.pluck($scope.assignedServices, 'id');
    var addServices = _.difference(serviceIdChosen, $scope.assignedServiceIds);
    var deleteServices = _.difference($scope.assignedServiceIds, serviceIdChosen);
    ProductService.saveProductServices(product, addServices, deleteServices, function() {
      $modalInstance.close();
    },function(list) {
      if (list) {
        var errors = UtilService.parseRelationshipErrorMessage(list, 'Some relationships are ');
        UtilService.lnotify(errors, true);
      }
      $scope.initDialog();
    });
  };

  $scope.initDialog = function(done) {
    async.waterfall([
      function(next) {
        // Step 1: list assigned services
        UtilService.showSpinner('Loading assigned service...');
        $scope.assignedServices = [];
        ProductService.getProductServices(product, function(services) {
          $scope.assignedServices = services.resources || [];
          $scope.assignedServiceIds = _.pluck($scope.assignedServices, 'id');
          next();
        }, function(){
          $modalInstance.dismiss('error');
        });
      },
      function(next) {
        // Step 2: load all services
        UtilService.showSpinner('Loading service...');
        ServiceService.getServices(function(result) {
          $scope.availableServices = result.resources;
          initServiceSelection();
          UtilService.hideSpinner();
        }, function(){
          $modalInstance.dismiss('error');
        });
      }]
    , function (err, result) {
      if (done) done(err, result);
    });
  };

  $scope.addServices = function() {
    angular.copy(_.difference($scope.availableServices, $scope.data.toBeAssignedServices.slice()), $scope.availableServices);
    angular.copy(_.union($scope.assignedServices, $scope.data.toBeAssignedServices.slice()), $scope.assignedServices);
    clearServiceSelection();
  };

  $scope.removeServices= function() {
    angular.copy(_.union($scope.availableServices, $scope.data.toBeRemovedServices.slice()), $scope.availableServices);
    angular.copy(_.difference($scope.assignedServices, $scope.data.toBeRemovedServices.slice()), $scope.assignedServices);
    clearServiceSelection();
  };

  function clearServiceSelection() {
    $scope.data.toBeAssignedServices = [];
    $scope.data.toBeRemovedServices = [];
  };

  var initServiceSelection = function() {
    clearServiceSelection();
    var assignedServiceIds = $scope.assignedServiceIds;
    $scope.availableServices = _.reject($scope.availableServices, function(product) {
      if (assignedServiceIds.indexOf(product.id) != -1) return true;
      return false;
    });
    $scope.availableServices = $scope.availableServices || [];
  };

})
.controller('AssignServiceRolesController', function ($scope, $modalInstance, data, UtilService, ServiceService, RoleService) {

  $scope.data = data || {};
  var productRole = $scope.data;

  $scope.cancel = function() {
    $modalInstance.dismiss('canceled');
  };

  $scope.initDialog = function() {
    async.waterfall([
      function(next) {
        UtilService.showSpinner('Loading services...');
        // Step 1: load all services
        ServiceService.getServices(function(result) {
          $scope.services = result.resources;
          next();
        }, function(){
          $modalInstance.dismiss('error');
        });
      }, function(next) {
        // Step 2: load all assigned serviceRoles
        UtilService.showSpinner('Loading service roles...');
        $scope.assignedRoles = [];
        RoleService.getServiceRolesByProductRole(productRole.role, function(result) {
          $scope.assignedRoles = result.lists;
          $scope.assignedRoleIds = [];
          _.each($scope.assignedRoles, function(role) { $scope.assignedRoleIds.push(role.role.id) });
          initServiceRoleSelection();
          UtilService.hideSpinner();
        }, function(){
          $modalInstance.dismiss('error');
        });
      }]
    );
  };

  $scope.loadServiceRoles = function(selectedService) {
    UtilService.showSpinner('Loading service roles...');
    $scope.selectedService = selectedService;
    $scope.availRoles = [];
    clearSelection();
    if (!selectedService) {
      UtilService.hideSpinner();
      return;
    }
    RoleService.getServiceRoles($scope.selectedService, function(result) {
      $scope.availRoles = UtilService.deferentRoles(result.lists, $scope.assignedRoles);
      UtilService.hideSpinner();
    });
  };

  $scope.assignRoles = function() {
    $scope.assignedRoles = _.union($scope.assignedRoles, $scope.data.toBeAssignedRoles);
    $scope.availRoles = _.difference($scope.availRoles, $scope.data.toBeAssignedRoles);
    clearSelection();
  };

  $scope.removeRoles = function() {
    if ($scope.selectedService) {
      $scope.availRoles = _.union($scope.availRoles, _.where($scope.data.toBeRemovedRoles, { serviceId: $scope.selectedService.id }));
    }
    $scope.assignedRoles = _.difference($scope.assignedRoles, $scope.data.toBeRemovedRoles);
    clearSelection();
  };

  $scope.save = function() {
    UtilService.showSpinner('Maintaining roles...');
    var roldsIdChosen = [];
    _.each($scope.assignedRoles, function(role) { roldsIdChosen.push(role.role.id) });
    var addRoles = _.difference(roldsIdChosen, $scope.assignedRoleIds);
    var deleteRoles = _.difference($scope.assignedRoleIds, roldsIdChosen);
    RoleService.saveServiceRolesByProductRole(productRole.role, addRoles, deleteRoles, function() {
      $modalInstance.close();
    }, function(list) {
      if (list) {
        var errors = UtilService.parseRelationshipErrorMessage(list, 'Some relationships are ');
        UtilService.lnotify(errors, true);
      }
      $scope.initDialog();
    });
  };

  var clearSelection = function() {
    $scope.data.toBeAssignedRoles = [];
    $scope.data.toBeRemovedRoles = [];
  };

  var initServiceRoleSelection = function () {
    clearSelection();
  };

})
.controller('AssignPermissionsController', function ($scope, $modalInstance, data, UtilService, PermissionService) {
  $scope.data = data || {};
  var serviceRole = $scope.data;

  $scope.cancel = function() {
    $modalInstance.dismiss('canceled');
  };

  $scope.save = function() {
    UtilService.showSpinner('Maintaining permissions...');
    var permissionIdChosen = _.pluck($scope.assignedPermissions, 'id');
    var addPermissions = _.difference(permissionIdChosen, $scope.assignedPermissionIds);
    var deletePermissions = _.difference($scope.assignedPermissionIds, permissionIdChosen);
    PermissionService.saveRolePermissions(serviceRole, addPermissions, deletePermissions, function() {
      $modalInstance.close();
    }, function(list) {
      if (list) {
        var errors = UtilService.parseRelationshipErrorMessage(list, 'Some relationships are ');
        UtilService.lnotify(errors, true);
      }
      $scope.initDialog();
    });
  };

  $scope.initDialog = function() {
    async.waterfall([
      function(next) {
        // Step 1: list assigned permissions
        UtilService.showSpinner('Loading assigned permissions...');
        $scope.assignedPermissions = [];
        PermissionService.getRolePermissions(serviceRole, function(permissions) {
          $scope.assignedPermissions = permissions.lists || [];
          $scope.assignedPermissionIds = _.pluck($scope.assignedPermissions, 'id');
          next();
        }, function(){
          $modalInstance.dismiss('error');
        });
      },
      function() {
        UtilService.showSpinner('Loading permissions...');
        // Step 2: load all permissions
        PermissionService.getPermissions(function(result) {
          $scope.availablePermissions = result.lists;
          initPermissionSelection();
          UtilService.hideSpinner();
        }, function(){
          $modalInstance.dismiss('error');
        });
      }], function (err, result) {

    });
  };

  $scope.addPermissions = function() {
    angular.copy(_.difference($scope.availablePermissions, $scope.data.toBeAssignedPermissions.slice()), $scope.availablePermissions);
    angular.copy(_.union($scope.assignedPermissions, $scope.data.toBeAssignedPermissions.slice()), $scope.assignedPermissions);
    clearPermissionSelection();
  };

  $scope.removePermissions= function() {
    angular.copy(_.union($scope.availablePermissions, $scope.data.toBeRemovedPermissions.slice()), $scope.availablePermissions);
    angular.copy(_.difference($scope.assignedPermissions, $scope.data.toBeRemovedPermissions.slice()), $scope.assignedPermissions);
    clearPermissionSelection();
  };

  function clearPermissionSelection() {
    $scope.data.toBeAssignedPermissions = [];
    $scope.data.toBeRemovedPermissions = [];
  };

  var initPermissionSelection = function() {
    clearPermissionSelection();
    var assignedPermissionIds = $scope.assignedPermissionIds;
    $scope.availablePermissions = _.reject($scope.availablePermissions, function(permission) {
      if (assignedPermissionIds.indexOf(permission.id) != -1) return true;
      return false;
    });
    $scope.availablePermissions = $scope.availablePermissions || [];
  };

});
