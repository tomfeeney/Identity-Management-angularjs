'use strict';

angular.module('IdMClientApp').service('ProductService', function ($http, webStorage, ConfigService, UtilService) {
  
  this.getProducts = function(onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    return $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/products',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseResourceList || {resources:[]});
    }).error(function(){
      if (onFailure) onFailure();
    });

  };
  
  this.createProduct = function(product, onSuccess) {
    
    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;
    
    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/product',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseResource: product }
    }).success(function (data, status, headers, config) {
      product.id = data.Id.id;
      onSuccess(product);
    });
    
  };
  
  this.updateProduct = function(product, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'PUT',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/product/' + product.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId },
      data: { EnterpriseResource: product }
    }).success(function (data, status, headers, config) {
      product.id = data.Id.id;
      onSuccess(product);
    });
    
  };
  
  this.removeProduct = function (product, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/product/' + product.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId}
    }).success(function (data, status, headers, config) {
      product.id = data.Id.id;
      onSuccess(product);
    });
    
  };

  this.getProductServices = function(product, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    return $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/product/' + product.id + '/service',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId }
    }).success(function (data, status, headers, config) {
      if (data.EnterpriseResourceList == "") {
        onSuccess({resources:[]});
      } else {
        onSuccess(data.EnterpriseResourceList);
      }
    }).error(function(){
      if (onFailure) onFailure();
    });

  };


  this.saveProductServices = function (product, addServices, deleteServices, onSuccess, onFailure) {
    var self = this;
    async.parallel({
      addItems: function (callback) {
        if (addServices.length == 0) { callback(null, {productId:product.id}); return;}
        self.addServicesToProduct(product, addServices, function (result) {
          callback(null, result);
        }, onFailure);
      },
      deleteItems: function (callback) {
        if (deleteServices.length == 0) { callback(null, {productId:product.id}); return;}
        self.removeServicesToProduct(product, deleteServices, function (result) {
          callback(null, result);
        }, onFailure);
      }
    }, function (err, results) {
      if (results.addItems.productId && results.deleteItems.productId && !results.addItems.failed && !results.deleteItems.failed){
        onSuccess();
      } else {
        results.addItems.failed = results.addItems.failed || [];
        results.deleteItems.failed = results.deleteItems.failed || [];
        onFailure(results.addItems.failed.concat(results.deleteItems.failed));
      }
    });
  };

  this.addServicesToProduct = function(product, services, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/product/' + product.id + '/service',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseServiceIdList: { ids: services } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseResourceActResult);
    }).error(function () {
      onFailure();
    });

  };

  this.removeServicesToProduct = function(product, services, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/product/' + product.id + '/service',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseServiceIdList: { ids: services } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseResourceActResult);
    }).error(function () {
      onFailure();
    });

  };
  
})
.service('ServiceService', function ($http, webStorage, ConfigService, UtilService) {

  this.getServices = function(onSuccess, onFailure) {
    
    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    return $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/service',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseResourceList || {resources:[]});
    }).error(function(){
      if (onFailure) onFailure();
    });
    
  };
  
  this.createService = function(service, onSuccess) {
    
    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;
    
    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/service',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseResource: service }
    }).success(function (data, status, headers, config) {
      service.id = data.Id.id;
      onSuccess(service);
    });
    
  };
  
  this.updateService = function(service, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'PUT',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/service/' + service.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId },
      data: { EnterpriseResource: service }
    }).success(function (data, status, headers, config) {
      service.id = data.Id.id;
      onSuccess(service);
    });
    
  };
  
  this.removeService = function (service, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/service/' + service.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId}
    }).success(function (data, status, headers, config) {
      service.id = data.Id.id;
      onSuccess(service);
    });
    
  };
  
})
.service('RoleService', function($http, webStorage, ConfigService, UtilService) {

  this.getProductRoles = function(product, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    return $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/product/' + product.id,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId }
    }).success(function (data, status, headers, config) {
      if (data.EnterpriseProductRoleList == "") {
        onSuccess({lists:[]});
      } else {
        onSuccess(data.EnterpriseProductRoleList);
      }
    });

  };
  
  this.createProductRole = function(role, onSuccess) {
    
    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;
    
    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/product/' + role.productId,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseRole: role.role }
    }).success(function (data, status, headers, config) {
      role.role.id = data.Id.id;
      onSuccess(role);
    });
    
  };

  this.updateProductRole = function(role, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'PUT',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/product/' + role.role.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId },
      data: { EnterpriseRole: role.role }
    }).success(function (data, status, headers, config) {
        role.role.id = data.Id.id;
        onSuccess(role);
      });

  };

  this.removeProductRole = function (role, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/product/' + role.role.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId}
    }).success(function (data, status, headers, config) {
        role.role.id = data.Id.id;
        onSuccess(role);
      });

  };

  this.getServiceRoles = function(service, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    return $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/service/' + service.id,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId }
    }).success(function (data, status, headers, config) {
      if (data.EnterpriseServiceRoleList == "") {
        onSuccess({ lists: [] });
        return;
      }
      onSuccess(data.EnterpriseServiceRoleList || { lists: [] });
    });

  };

  this.createServiceRole = function(role, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/service/' + role.serviceId,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseRole: role.role }
    }).success(function (data, status, headers, config) {
        role.role.id = data.Id.id;
        onSuccess(role);
      });

  };

  this.updateServiceRole = function(role, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'PUT',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/service/' + role.role.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId },
      data: { EnterpriseRole: role.role }
    }).success(function (data, status, headers, config) {
        role.role.id = data.Id.id;
        onSuccess(role);
      });

  };

  this.removeServiceRole = function (serviceRole, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/service/' + serviceRole.role.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId}
    }).success(function (data, status, headers, config) {
        onSuccess(serviceRole);
      });

  };

  this.getServiceRolesByProductRole = function(productRole, onSuccess, onFailure) {
    
    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    return $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/product/services/' + productRole.id,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId }
    }).success(function (data, status, headers, config) {
      if (data.EnterpriseServiceRoleList == "") {
        onSuccess({ lists: [] });
        return;
      }
      onSuccess(data.EnterpriseServiceRoleList || { lists: [] });
    }).error(function(){
      if (onFailure) onFailure();
    });

  };
  
  this.saveServiceRolesByProductRole = function(productRole, addRoles, deleteRoles, onSuccess, onFailure) {
    var self = this;
    async.parallel({
      addItems: function (callback) {
        if (addRoles.length == 0) { callback(null, {productRoleId:productRole.id}); return;}
        self.addServiceRolesToProductRole(productRole, addRoles, function (result) {
          callback(null, result);
        }, onFailure);
      },
      deleteItems: function (callback) {
        if (deleteRoles.length == 0) { callback(null, {productRoleId:productRole.id}); return;}
        self.removeServiceRolesToProductRole(productRole, deleteRoles, function (result) {
          callback(null, result);
        }, onFailure);
      }
    }, function (err, results) {
      if (results.addItems.productRoleId && results.deleteItems.productRoleId && !results.addItems.failed && !results.deleteItems.failed){
        onSuccess();
      } else {
        results.addItems.failed = results.addItems.failed || [];
        results.deleteItems.failed = results.deleteItems.failed || [];
        onFailure(results.addItems.failed.concat(results.deleteItems.failed));
      }
    });
  };
  
  this.addServiceRolesToProductRole = function(productRole, serviceRoles, onSuccess, onFailure) {
    
    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    
    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/product/services/' + productRole.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseRoleIdList: { ids: serviceRoles } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseServiceRoleProductActResult);
    }).error(function () {
      onFailure();
    });
    
  };
  
  this.removeServiceRolesToProductRole = function(productRole, serviceRoles, onSuccess, onFailure) {
    
    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    
    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entroleJ/enterprise/role/product/services/' + productRole.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseRoleIdList: { ids: serviceRoles } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseServiceRoleProductActResult);
    }).error(function () {
      onFailure();
    });
    
  };
  
})
.service('PermissionService', function($http, ConfigService, webStorage, UtilService) {

  this.getPermissions = function(onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    return $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/endpoint',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId }
    }).success(function (data, status, headers, config) {
      if (data.EnterpriseEndpointListObj == "") {
        onSuccess({ lists: [] });
      } else {
        onSuccess(data.EnterpriseEndpointListObj || {lists:[]});
      }
    }).error(function(){
      if (onFailure) onFailure();
    });

  };

  this.createPermission = function(permission, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/endpoint',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseEndpoint: permission }
    }).success(function (data, status, headers, config) {
      permission.id = data.Id.id;
      onSuccess(permission);

    });
  };

  this.updatePermission = function(permission, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'PUT',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/endpoint/' + permission.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId },
      data: { EnterpriseEndpoint: permission }
    }).success(function (data, status, headers, config) {
      onSuccess(permission);
    });
  };

  this.removePermission = function (permission, onSuccess) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/resource/endpoint/' + permission.id,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId}
    }).success(function (data, status, headers, config) {
      onSuccess(permission);
    });
  };

  this.getRolePermissions = function(serviceRole, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    return $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/role/service/' + serviceRole.serviceId + '/' + serviceRole.role.id + '/endpoint',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId }
    }).success(function (data, status, headers, config) {
        if (data.EnterpriseEndpointListObj == "") {
          onSuccess({ lists: [] });
        } else {
          onSuccess(data.EnterpriseEndpointListObj);
        }
    }).error(function(){
      if (onFailure) onFailure();
    });
  };

  this.saveRolePermissions = function (serviceRole, addPermissions, deletePermissions, onSuccess, onFailure) {
    var self = this;
    async.parallel({
      addItems: function (callback) {
        if (addPermissions.length == 0) { callback(null, {roleId:serviceRole.role.id}); return;}
        self.addPermissionsToRole(serviceRole, addPermissions, function (result) {
          callback(null, result);
        }, onFailure);
      },
      deleteItems: function (callback) {
        if (deletePermissions.length == 0) { callback(null, {roleId:serviceRole.role.id}); return;}
        self.removePermissionsToRole(serviceRole, deletePermissions, function (result) {
          callback(null, result);
        }, onFailure);
      }
    }, function (err, results) {
      if (results.addItems.roleId && results.deleteItems.roleId && !results.addItems.failed && !results.deleteItems.failed){
        onSuccess();
      } else {
        results.addItems.failed = results.addItems.failed || [];
        results.deleteItems.failed = results.deleteItems.failed || [];
        onFailure(results.addItems.failed.concat(results.deleteItems.failed));
      }
    });
  };

  this.addPermissionsToRole = function(serviceRole, services, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/role/service/' + serviceRole.serviceId + '/' + serviceRole.role.id + '/endpoint',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseEndpointList: { ids: services } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseEndpointActResult);
    }).error(function () {
      onFailure();
    });

  };

  this.removePermissionsToRole = function(serviceRole, services, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entpermissionJ/enterprise/role/service/' + serviceRole.serviceId + '/' + serviceRole.role.id + '/endpoint',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseEndpointList: { ids: services } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseEndpointActResult);
    }).error(function () {
      onFailure();
    });

  };


});