'use strict';

angular.module('IdMClientApp').service('GroupService', function ($http, $q, ConfigService, UtilService, webStorage) {

    var memberships = { 'automatic': 'Automatic', 'approval': 'Approval' };

    var scopes = { 'enterprise': 'Enterprise', 'application': 'Application' };

    var visibilities = { 'public': 'Public', 'hidden': 'Hidden' };

    this.getMemberships = function () {
        return memberships;
    };

    this.getScopes = function () {
        return scopes;
    };

    this.getVisibilities = function () {
        return visibilities;
    };
    
    var toGroupJson = function (payload) {
      payload = angular.fromJson(payload);
      if (angular.isString(payload.tags)) {
        payload.tags = _.compact(payload.tags.split(/[ ,]+/));
      }
      if (_.isEmpty(payload.tags)) {
        payload.tags = [];
      }
      return JSON.stringify({ EnterpriseGroup: payload });
    };
  
    var toGroupBatchJson = function (payloads) {
      return JSON.stringify({ EnterpriseSubGroupBatch: { subGrpIdList: payloads } });
    };
  
    var toUserBatchJson = function (payload) {
      return JSON.stringify({ EnterpriseGroupUsrBatch: { userEmailList: payload } });
    };

    this.getGroups = function (onSuccess, onFailure) {

      var entId = webStorage.get('enterpriseId');
      var token = UtilService.getToken();
      var accId = webStorage.get('user').id;

      $http({
        method: 'GET',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/' + entId + '/groups',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId }
      }).success(function (data, status, headers, config) {
        if (data.EnterpriseGroupList) {
          onSuccess(data.EnterpriseGroupList.groups);
        } else {
          onSuccess([]);
        }
      }).error(function() {
        if (onFailure) onFailure();
      });
    };

    this.getSubGroups = function (parentGroup, onSuccess, onFailure) {

      var entId = webStorage.get('enterpriseId');
      var token = UtilService.getToken();
      var accId = webStorage.get('user').id;

      $http({
        method: 'GET',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/' + entId + '/group/' + parentGroup.id + '/subGroups',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId }
      }).success(function (data, status, headers, config) {
          onSuccess(data.EnterpriseGroupList.groups);
      }).error(function() {
        onFailure();
      });
      
    };


    this.addGroup = function (groupNew, onSuccess, notify) {

      var entId = webStorage.get('enterpriseId');
      var token = UtilService.getToken();
      var accId = webStorage.get('user').id;
  
      var payload = toGroupJson(groupNew);
  
      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/' + entId + '/group',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
        data: payload,
        message_config: { 'DUPLICATED_GROUP': ["Group name: ", groupNew.name, " is in use!"].join('') }
      }).success(function (data, status, headers, config) {
        if (status === 200 && data.Id) {
          groupNew.id = data.Id.id;
          onSuccess(groupNew);
          notify("Group successfully added.", false, true);
        } else if ((status === 400) || (status === 500)) {
          notify(data.error_cause, true);
        } else if (status === 200 && data.JSONException) {
          if (data.JSONException.errorCodes == "DUPLICATED_GROUP") {
            notify(["Group name: ", groupNew.name, " is in use!"].join(''));
          } else {
            notify(data.JSONException.message, true);
          }
        }
      });

    };

    this.removeGroup = function (group, onSuccess, notify) {

      var entId = webStorage.get('enterpriseId');
      var token = UtilService.getToken();
      var accId = webStorage.get('user').id;

      $http({
        method: 'DELETE',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/' + entId + '/group/' + group.id,
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId}
      }).success(function (data, status, headers, config) {
        if (status === 200 && data.Id) {
          onSuccess(group);
//          notify("Group successfully deleted.", false);
        } else if ((status === 400) || (status === 500)) {
          notify(data.error_cause, true);
        } else if (status === 200 && data.JSONException) {
          notify(data.JSONException.message, true);
        }
      });
    };

    this.updateGroup = function (group, notify, onSuccess) {

        var entId = webStorage.get('enterpriseId');
        var token = UtilService.getToken();
        var accId = webStorage.get('user').id;

        var payload = toGroupJson(group);

        $http({
          method: 'PUT',
          url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/' + entId + '/group/' + group.id,
          headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId },
          data: payload
        }).success(function (data, status, headers, config) {
          if (status === 200 && data.Id) {
            onSuccess(group);
          } else if ((status === 400) || (status === 500)) {
            notify(data.error_cause, true);
          } else if (status === 200 && data.JSONException) {
            if (data.JSONException.errorCodes == 'DB-011') {
              notify(['Group name: ', group.name, ' is in use!'].join(''), true);
            } else {
              notify(data.JSONException.message, true);
            }
          }
        });
    };

  this.saveSubgroups = function (parentGroup, addGroups, deleteGroups, onSuccess, onFailure) {
    var self = this;
    async.parallel({
      addItems: function (callback) {
        if (addGroups.length == 0) { callback(null, {ownerId:parentGroup.id}); return;}
        self.addSubgroup(parentGroup, addGroups, function (result) {
          callback(null, result);
        }, onFailure);
      },
      deleteItems: function (callback) {
        if (deleteGroups.length == 0) { callback(null, {ownerId:parentGroup.id}); return;}
        self.removeSubgroup(parentGroup, deleteGroups, function (result) {
          callback(null, result);
        }, onFailure);
      }
    }, function (err, results) {
      if (results.addItems.ownerId && results.deleteItems.ownerId && !results.addItems.failed && !results.deleteItems.failed){
        onSuccess();
      } else {
        results.addItems.failed = results.addItems.failed || [];
        results.deleteItems.failed = results.deleteItems.failed || [];
        onFailure(results.addItems.failed.concat(results.deleteItems.failed));
      }
    });
  };

  this.addSubgroup = function(parentGroup, users, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/' + entId + '/group/' + parentGroup.id + '/subGroups',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId },
      data: { EnterpriseSubGroupBatch: { subGrpIdList: users } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseSubGroupBatchResult);
    }).error(function () {
      onFailure();
    });

  };

  this.removeSubgroup = function(parentGroup, users, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/' + entId + '/group/' + parentGroup.id + '/subGroups',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId },
      data: { EnterpriseSubGroupBatch: { subGrpIdList: users } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseSubGroupBatchResult);
    }).error(function () {
      onFailure();
    });

  };

    this.getGroupUsers = function (group, onSuccess, onFailure) {

      var entId = webStorage.get('enterpriseId');
      var token = UtilService.getToken();
      var accId = webStorage.get('user').id;

      $http({
        method: 'GET',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/' + entId + '/group/' + group.id + '/users',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId}
      }).success(function (data, status, headers, config) {
          onSuccess(data.EnterpriseGroupUserList.enterpriseUsers);
      }).error(function () {
        onFailure();
      });
    };

  this.saveGroupUsers = function (group, addUsers, deleteUsers, onSuccess, onFailure) {
    var self = this;
    async.parallel({
      addItems: function (callback) {
        if (addUsers.length == 0) { callback(null, {id:group.id}); return;}
        self.addUsersToGroup(group, addUsers, function (result) {
          callback(null, result);
        }, onFailure);
      },
      deleteItems: function (callback) {
        if (deleteUsers.length == 0) { callback(null, {id:group.id}); return;}
        self.removeUsersToGroup(group, deleteUsers, function (result) {
          callback(null, result);
        }, onFailure);
      }
    }, function (err, results) {
      if (results.addItems.id && results.deleteItems.id && !results.addItems.failed && !results.deleteItems.failed){
        onSuccess();
      } else {
        results.addItems.failed = results.addItems.failed || [];
        results.deleteItems.failed = results.deleteItems.failed || [];
        onFailure(results.addItems.failed.concat(results.deleteItems.failed));
      }
    });
  };

  this.addUsersToGroup = function(group, users, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var idProvider = webStorage.get('idProvider');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/' + entId + '/group/' + group.id + '/users',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId, 'ID-Provider': idProvider },
      data: { EnterpriseGroupUsrBatch: { userEmailList: users } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseGroupUsrBatchResult);
    }).error(function () {
      onFailure();
    });

  };

  this.removeUsersToGroup = function(group, users, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var idProvider = webStorage.get('idProvider');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/' + entId + '/group/' + group.id + '/users',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId, 'ID-Provider': idProvider},
      data: { EnterpriseGroupUsrBatch: { userEmailList: users } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseGroupUsrBatchResult);
    }).error(function () {
      onFailure();
    });

  };

  this.getGroupRoles = function (group, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/group/' + group.id + '/role',
      params: {'needProductId': true},
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId}
    }).success(function (data, status, headers, config) {
      if (data.EnterpriseProductRoleList == "") {
        onSuccess({lists:[]});
      } else {
        onSuccess(data.EnterpriseProductRoleList);
      }
    }).error(function(){
      onFailure();
    });
  };

  this.saveGroupRoles = function (group, addRoles, deleteRoles, onSuccess, onFailure) {
    var self = this;
    async.parallel({
      addItems: function (callback) {
        if (addRoles.length == 0) { callback(null, {groupId:group.id}); return;}
        self.addRolesToGroup(group, addRoles, function (result) {
          callback(null, result);
        }, onFailure);
      },
      deleteItems: function (callback) {
        if (deleteRoles.length == 0) { callback(null, {groupId:group.id}); return;}
        self.removeRolesToGroup(group, deleteRoles, function (result) {
          callback(null, result);
        }, onFailure);
      }
    }, function (err, results) {
      if (results.addItems.groupId && results.deleteItems.groupId && !results.addItems.failed && !results.deleteItems.failed){
        onSuccess();
      } else {
        results.addItems.failed = results.addItems.failed || [];
        results.deleteItems.failed = results.deleteItems.failed || [];
        onFailure(results.addItems.failed.concat(results.deleteItems.failed));
      }
    });
  };

  this.addRolesToGroup = function(group, services, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/group/' + group.id + '/role',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseRoleIdList: { ids: services } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseProductRoleGroupActResult);
    }).error(function () {
       onFailure();
    });

  };

  this.removeRolesToGroup = function(group, services, onSuccess, onFailure) {

    var entId = webStorage.get('enterpriseId');
    var token = UtilService.getToken();
    var accId = webStorage.get('user').id;

    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/entgroupJ/enterprise/group/' + group.id + '/role',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': token, 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
      data: { EnterpriseRoleIdList: { ids: services } }
    }).success(function (data, status, headers, config) {
      onSuccess(data.EnterpriseProductRoleGroupActResult);
    }).error(function () {
      onFailure();
    });

  };

});
