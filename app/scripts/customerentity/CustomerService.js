'use strict';

angular.module('IdMClientApp').service('CustomerService', function ($http, webStorage, ConfigService) {
  
  this.getCustomerRoles = function(customer, onSuccess) {
    
    var payload = {
      authToken: webStorage.get('authToken')
    };
    if (customer) {
      payload.customerId = customer.id;
    }

//    return $http({
//      method: 'POST',
//      url: ConfigService.getEndpoint() + '/identitymanagement/services/generalJ/listCustomerRoles',
//      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
//      data: payload
//    }).success(function (data, status, headers, config) {
//      onSuccess(data.CustomerRoleList);
//    });
    
    var mockResult = {
        "CustomerRoleList": [{
          "id": "6c233344-979e-11e3-9eda-a0b3cc283ef2",
          "role": "CE Buyer",
        }, {
          "id": "6c233345-979e-11e3-9eda-a0b3cc283ef2",
          "role": "CE Installer",
        }, {
          "id": "6c233346-979e-11e3-9eda-a0b3cc283ef2",
          "role": "CE Admin",
        }]
      };
    
    onSuccess(mockResult.CustomerRoleList);
    
  };
 
  this.getCustomerEntities = function(onSuccess) {
    
    var accId = webStorage.get('user').id;

//    return $http({
//      method: 'GET',
//      url: ConfigService.getEndpoint() + '/identitymanagement/services/genericJ/accountid/' + accId,
//      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
//    }).success(function (data, status, headers, config) {
//      onSuccess(data.OutAccountInformation);
//    });

    var mockResult = {
      "OutAccountInformation": {
        "accountInfo": {
          "accountState": "A",
          "accountType": "CONSUMER",
          "country": "US",
          "email": "abc@hp.com",
          "enabled": true,
          "enterpriseId": "41e585b7-dd4c-11e2-a3c8-e4115b4c35df",
          "guid": "95ac35c8-987a-11e3-9eda-a0b3cc283ef2",
          "hasCR": false,
          "id": "95ac35c8-987a-11e3-9eda-a0b3cc283ef2",
          "idProvider": "hp",
          "language": "en"
        },
        "customers": [{
          "id": "027b02f4-dd5a-11e2-bf0d-e4115b4c35df",
          "name": "A Customer",
          "email": "abc@hp.com",
          "roles": [{
            "role": "CE Admin",
            "roleId": "02928297-dd5a-11e2-bf0d-e4115b4c35df"
          }]
        }, {
          "id": "037b02f4-dd5a-11e2-bf0d-e4115b4c35df",
          "name": "B Customer",
          "email": "abc2@hp.com",
          "roles": [{
            "role": "CE Buyer",
            "roleId": "02938297-dd5a-11e2-bf0d-e4115b4c35df"
          }, {
            "role": "CE Installer",
            "roleId": "02938295-dd5a-11e2-bf0d-e4115b4c35df"
          }]
        }],
        "enterpriseId": "41e585b7-dd4c-11e2-a3c8-e4115b4c35df",
        "groups": [{
          "groupId": "017b02f4-dd5a-11e2-bf0d-e4115b4c35df",
          "groupName": "hp default Group"
        }],
        "permissions": [{
          "id": "c5269244-74b8-11e2-a491-0800278eb971",
          "permission": "password_reset"
        }, {
          "id": "c52532ad-74b8-11e2-a491-0800278eb971",
          "permission": "basic_access"
        }],
        "roles": [{
          "role": "hp default Product Role",
          "roleId": "01928297-dd5a-11e2-bf0d-e4115b4c35df"
        }],
        "devices": [{
          "active": false,
          "dateCreated": "2014-02-18T16:56:41.344+08:00",
          "deviceFamily": "Castle",
          "deviceID": "111111DD-2D22-33D3-4444-E55555555555",
          "deviceModel": "castle",
          "id": "e8c9f407-2436-11e3-b42c-a0b3cc283ef2",
          "modelDescription": "Pre",
          "modelID": 106,
          "nduID": "111111dd-2d22-33d3-4444-e55555555555",
          "osMajor": 1,
          "osMinor": 1,
          "osRevision": 0,
          "osversion": "1.1.0",
          "platform": "Linux"
        }]
      }
    };
    
    onSuccess(mockResult.OutAccountInformation);
    
  };
  
  this.getCustomerUsers = function(customer, role, onSuccess) {
    
    var payload = {
      authToken: webStorage.get('authToken'),
      customerId: customer.id
    };
    if (role) {
      payload.roleId = role.id;
    }

//    return $http({
//      method: 'POST',
//      url: ConfigService.getEndpoint() + '/identitymanagement/services/generalJ/listUsersOfCustomer',
//      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
//      data: payload
//    }).success(function (data, status, headers, config) {
//      onSuccess(data.UserList);
//    });
    
    var mockResult = {
        "UserList": [{
          "id": "6c233344-979e-11e3-9eda-a0b3cc283ef2",
          "email": "abc@hp.com",
          "roles": [{
            "role": "CE Buyer",
            "roleId": "02938297-dd5a-11e2-bf0d-e4115b4c35df"
          }]
        }, {
          "id": "6c233345-979e-11e3-9eda-a0b3cc283ef2",
          "email": "abc2@hp.com",
          "roles": [{
            "role": "CE Buyer",
            "roleId": "02938297-dd5a-11e2-bf0d-e4115b4c35df"
          }]
        }, {
          "id": "6c133344-979e-11e3-9eda-a0b3cc283ef2",
          "email": "abc3@hp.com",
          "roles": [{
            "role": "CE Buyer",
            "roleId": "02938297-dd5a-11e2-bf0d-e4115b4c35df"
          }, {
            "role": "CE Installer",
            "roleId": "02938298-dd5a-11e2-bf0d-e4115b4c35df"
          }]
        }]
      };
    
    onSuccess(mockResult.UserList);

  };
  
});