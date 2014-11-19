'use strict';

angular.module('IdMClientApp').service('EnterpriseService', function ($http, ConfigService, UtilService, webStorage) {

    var enterprises = [];

    var enterpriseId;

    var DEFAULTAUTHOWNER = 'HPWS';

    this.getDefaultAuthProvider = function () {
        return authProviders[0];
    };

    var authProviders = [
        {
            name: 'HP',
            code: 'HP'
        }
    ];

    this.getAuthProviders1 = function () {
        return authProviders;
    };

    this.getAuthProviders = function (onSuccess, notify) {

        $http({
            method: 'GET',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/entJ/enterprise/idprovider',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache'}
        }).success(function (data, status, headers, config) {
          if (status === 200 && data.EnterpriseIdProviders) {
            authProviders = 
              _.map(
                _.filter(data.EnterpriseIdProviders.lists, function(enterpriseIdProvider) {
                  return enterpriseIdProvider.status == "ENABLE";
                }), 
                function(enterpriseIdProvider) {
                  return { name: enterpriseIdProvider.idProvider, code: enterpriseIdProvider.idProvider };
                });
            onSuccess(authProviders);
          } else if ((status === 400) || (status === 500)) {
            notify(data.error_cause, true);
          } else if (status === 200 && data.JSONException) {
            notify(data.JSONException.message, true);
          }            
//        }).error(function (data, status, headers, config) {
//            notify('getAuthProviders', true);
        });

    };

    this.getEnterprises = function (token, notify) {

        $http({
            method: 'GET',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/entJ/enterprise',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': 'token'}
        }).success(function (data, status, headers, config) {
                if (status === 200 && data.EnterpriseGroupList) {
                    enterprises = data.EnterpriseList;
                } else if ((status === 400) || (status === 500)) {
                    notify(data.error_cause, true);
                } else if (status === 200 && data.JSONException) {
                    notify(data.JSONException.message, true);
                }
//            }).error(function (data, status, headers, config) {
//                notify('getEnterprises failed', true);
            });

        return enterprises;
    };
    
    this.getEnterprise = function (entId, onSuccess) {
      
      var accId = webStorage.get('user').id;

        $http({
            method: 'GET',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/entJ/enterprise/' + entId,
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId}
        }).success(function (data, status, headers, config) {
            if (status === 200 && data.Enterprise) {
                var enterprise = data.Enterprise;
                onSuccess(enterprise);
            }
        });
  
    };
    
    this.getCurrentEnterprise = function(onSuccess) {
      this.getEnterprise(webStorage.get('enterpriseId'), onSuccess);
    };

    this.createEnterprise = function (token, enterprise, notify) {

        var payload = JSON.stringify(enterprise);

        $http({
            method: 'POST',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/entJ/enterprise',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': 'token'},
            data: payload
        }).success(function (data, status, headers, config) {
                if (status === 200 && data.EnterpriseGUID) {
                    enterpriseId = data.EnterpriseGUID.guid;
                } else if ((status === 400) || (status === 500)) {
                    notify(data.error_cause, true);
                } else if (status === 200 && data.JSONException) {
                    notify(data.JSONException.message, true);
                }
//            }).error(function (data, status, headers, config) {
//                notify('createEnterprise', true);
            });
    };

    this.deleteEnterprise = function (entId, token, notify) {

        $http({
            method: 'DELETE',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/entJ/enterprise' + entId,
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': 'token'}
        }).success(function (data, status, headers, config) {
                if (status === 200 && data.EnterpriseGUID) {
                    notify("Enterprise Deleted successfully", false);
                } else if ((status === 400) || (status === 500)) {
                    notify(data.error_cause, true);
                } else if (status === 200 && data.JSONException) {
                    notify(data.JSONException.message, true);
                }
//            }).error(function (data, status, headers, config) {
//                notify('deleteEnterprise', true);
            });
    };

    this.updateEnterprise = function (entId, token, enterprise, notify) {

        var payload = JSON.stringify(enterprise);

        $http({
            method: 'PUT',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/entJ/enterprise' + entId,
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': 'token'},
            data: payload
        }).success(function (data, status, headers, config) {
                if (status === 200 && data.EnterpriseGUID) {
                    notify("Enterprise Updated successfully", false);
                } else if ((status === 400) || (status === 500)) {
                    notify(data.error_cause, true);
                } else if (status === 200 && data.JSONException) {
                    notify(data.JSONException.message, true);
                }
//            }).error(function (data, status, headers, config) {
//                notify('updateEnterprise', true);
            });
    };
    
    function parsePage(pageInfo) {
      if (pageInfo) {
        return '?' + $.param(pageInfo);
      }
      return '';
    }
    
    this.searchPaginatedEnterpriseUsers = function(searchInfo, pageInfo, onSuccess, onFailure) {
      
      var entId = webStorage.get('enterpriseId');
      var token = UtilService.getToken();
      var accId = webStorage.get('user').id;
      var idProvider = webStorage.get('idProvider');
      
      searchInfo = searchInfo || {};
      searchInfo.enabled = true;
      searchInfo.idProvider = idProvider;
      searchInfo.authOwner = DEFAULTAUTHOWNER;

      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/entusersJ/enterprise/' + entId + '/users/search' + parsePage(pageInfo),
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId },
        data: { SearchUsers: searchInfo }
      }).success(function (data, status, headers, config) {
        if (!data.SearchUsersResultList) {
          if (onFailure) onFailure();
          return;
        }
        onSuccess(data.SearchUsersResultList, {
          start: data.SearchUsersResultList.fetchInfo.nextStartNo,
          limit: data.SearchUsersResultList.fetchInfo.limit,
          totalCount: data.SearchUsersResultList.fetchInfo.totalCount
        });
      }).error(function () {
        if (onFailure) onFailure();
      });
      
    };

    this.getEnterpriseUsers = function (onSuccess, onFailure) {
        
        var entId = webStorage.get('enterpriseId');
        var token = UtilService.getToken();
        var accId = webStorage.get('user').id;

        $http({
            method: 'GET',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/entusersJ/enterprise/' + entId + '/users',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', /* 'Authorization': token, */ 'X-HP-Principal-Id': accId, 'X-HP-Enterprise-Id': entId},
            message_config: { title: 'Get Enterprise Users' }
        }).success(function (data, status, headers, config) {
          onSuccess(data.EnterpriseUsers.enterpriseUsers);
        }).error(function () {
          if (onFailure) onFailure();
        });
    };
});
