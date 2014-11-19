'use strict';

angular.module('IdMClientApp').controller('TokenGatewayMainController', function($scope, $location, $filter, UtilService, TokenGatewayService) {
  
    $scope.initPage = function() {
      $scope.templatePath = '/views/tokenGateway/clients.html';
      $scope.currentPage = 1;
      $scope.searchStr = "";
    };

    $scope.selectTab = function(tab) {
        $scope.templatePath = '/views/tokenGateway/' + tab + '.html';
    };


    $scope.setClientsPage = function (pageNo) {
      $scope.currentPage = pageNo;
      $scope.initClients();
    };

    $scope.searchClients = function(searchCriteria) {
      $scope.searchStr = searchCriteria;
      $scope.currentPage = 1;
      $scope.initClients();
    }

    $scope.initClients = function () {
      $scope.grantFlows = TokenGatewayService.getGrantFlows();
      $scope.clientTypes = TokenGatewayService.getClientTypes();
      $scope.localeCodes = TokenGatewayService.getLocaleCodes();
      UtilService.showSpinner('Loading clients...');
      if (typeof $scope.currentPage == 'undefined') {
          $scope.currentPage = 1;
      }
      TokenGatewayService.getClients(($scope.currentPage-1)*10, 10, $scope.searchStr, function(clients) {
        $scope.clients = clients.clientsInfo;
        $scope.totalClientsNr = clients.fetchInfo.totalCount;
        reloadClients();
        });
    };


    var reloadClients = function(currentPage) {
        UtilService.hideSpinner();
    };


    $scope.removeClient = function (client) {
      UtilService.confirm('Do you really want to delete the client?', 'Delete Client').then(function yes() {
        UtilService.showSpinner('deleting client...');
        TokenGatewayService.removeClient(client, function(client) {
          UtilService.notify('Client successfully deleted.');
          $scope.initClients();
        }, function(message, isError) {
          notify(message, isError);
        });
      });
    };


    $scope.initPermissions = function (filterStr) {

      UtilService.showSpinner('Loading permissions...');

      TokenGatewayService.getPermissions(function(permissions) {
        $scope.permissions = permissions;    
        $scope.matchPermissions = $filter('filter')(permissions, filterStr);
        $scope.setPermissionsPage(1);
        reloadPermissions();
      });
    };

    $scope.searchPermissions = function(searchCriteria) {
      $scope.searchStr = searchCriteria;
      $scope.currentPage = 1;
      $scope.initPermissions(searchCriteria);
      $scope.setPermissionsPage(1);
    };

    $scope.setPermissionsPage = function (pageNo) {
      $scope.currentPage = pageNo;
      $scope.pagePermissions = $scope.setPage(pageNo, $scope.matchPermissions);
    };

    function notify(message, isError) {
      UtilService.lnotify(message, isError);
    };

    var reloadPermissions = function(currentPage) {
        UtilService.hideSpinner();
    };

    var loadPermissions = function(callback, data) {
        TokenGatewayService.getPermissions(function(permissions) {
            callback(permissions, data);
        });
    };

    var showClientDlg = function(perms) {
      var data = { 
        isUpdateClient: false,
        permissions: perms,
        grantFlows: $scope.grantFlows,
        clientTypes: $scope.clientTypes,
        localeCodes: $scope.localeCodes,
        permsArr: [],

        client: {
                "clientInfo" : {
                "tokenRefreshPolicy" : false,
                "isManagedInstance": false,
                "needsGrantConfirmation": false,
                "descriptions" : [{}],
                "redirectUris" : [
                ],
                "permissions" : [],
            }
        }
      };
      UtilService.showDialog('views/tokenGateway/client-dlg.html', data, 'UpdateClientController').then(function(data) {
        UtilService.showSpinner('Adding client...');
        TokenGatewayService.addClient(data.client, function(message, isError) {
          $scope.initClients();
          notify(message, isError);
        });
      });
    };

    var showUClientDlg = function(perms, client) {
        var data = {};
        data.isUpdateClient = true,
        data.permissions = perms,
        data.grantFlows = $scope.grantFlows,
        data.clientTypes = $scope.clientTypes,
        data.localeCodes = $scope.localeCodes,

        data.client = client;
        UtilService.showDialog('views/tokenGateway/client-dlg.html', data, 'UpdateClientController').then(function(data) {
          UtilService.showSpinner('Updating client...');
          TokenGatewayService.updateClient(data.client, function(message) {
            $scope.initClients();
            notify(message, false);
          }, function(message, isError) {
            notify(message, true);
          });
        });
    };

    $scope.viewClientDlg = function(client) {
      var data = {};
      data.grantFlows = $scope.grantFlows,
      data.clientTypes = $scope.clientTypes,
      data.localeCodes = $scope.localeCodes,

      data.client = client;
      UtilService.showDialog('views/tokenGateway/client-view-dlg.html', data, 'UpdateClientController').then(function(data) {
          UtilService.showSpinner('Viewing client...');
      });
    };

    $scope.addClientDlg = function() {
      loadPermissions(showClientDlg);
    };

    $scope.updateClientDlg = function(data) {
      loadPermissions(showUClientDlg, data);
    }

  
})

.controller('UpdateClientController', function ($scope, $modalInstance, data) {
 
    $scope.data = data || {};
  
    $scope.cancel = function() {
        $modalInstance.dismiss('canceled');
    };
  
    $scope.close = function() {
        $modalInstance.close();
    };
  
    $scope.save = function() {
        $modalInstance.close($scope.data);
    };
  
    $scope.yes = $scope.close;
    $scope.no = $scope.cancel;


    $scope.toggleSelection = function (selectedPermissions, permission) {
        var idx = selectedPermissions.indexOf(permission);
        // is currently selected
        if (idx > -1) {
          selectedPermissions.splice(idx, 1);
        }

        // is newly selected
        else {
          selectedPermissions.push(permission);
        }
    };
})
