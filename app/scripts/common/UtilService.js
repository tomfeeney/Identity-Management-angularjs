'use strict';

angular.module('IdMClientApp').config(function(blockUIConfigProvider) {
  blockUIConfigProvider.autoBlock(false);
  blockUIConfigProvider.templateUrl('/views/spinner.html');
})
.run(function($rootScope, $location, UtilService, IdMConfig) {
  
  $rootScope.idmRedirectTo = function(url) {
    $location.path(url);
  };
  
  $rootScope.showDialog = function(url, data, controller) {
    UtilService.showDialog(url, data, controller, true);
  };
  
  $rootScope.itemsPerPage = 10;
  
  $rootScope.stringPredicator = angular.bind(UtilService, UtilService.stringComparator);
  
  $rootScope.setPage = function (pageNo, matchItems) {
    return matchItems.slice((pageNo - 1) * $rootScope.itemsPerPage, pageNo * $rootScope.itemsPerPage);
  };
  
  $rootScope.hasUrlParam = function(param, expect) {
    return UtilService.hasUrlParam($location.search(), param, expect);
  };
  
  $rootScope.isMode = function(mode) {
    return UtilService.getUrlParam($location.search(), 'mode') == mode;
  };

  // used by HP Web ID, authRequest is required.
  $rootScope.getEula = function() {
    if ($location.search().eula) {
      var src = $location.search().eula;
      return [ '/views/webID/eula_', src, '.html' ].join('');
    }
    var src = 'hpws';
    var authRequest = $rootScope.WebIdAuthRequest;
    if (authRequest) src = IdMConfig.eula[authRequest.clientId] || 'hpws';
    return [ '/views/webID/eula_', src, '.html' ].join('');
  };
  
})
.service('UtilService', function($injector, $translate, $timeout, webStorage, blockUI) {
  
  this.notify = function(msg, title) {
    this.hideSpinner();
    if (angular.isObject(msg)) {
      msg = angular.toJson(msg);
    }
    msg = this.translate(msg) || msg;
    var dialogs = $injector.get('dialogs');
    dialogs.notify(title || 'Identity Management Console', msg);
  };

  this.confirm = function(msg, title) {
    this.hideSpinner();
    var dialogs = $injector.get('dialogs');
    msg = this.translate(msg) || msg;
    title = this.translate(title) || title;
    var dlg = dialogs.confirm(title || 'Identity Management Console', msg);
    return dlg.result;
  };
  
  this.error = function(msg, title) {
    this.hideSpinner();
    var dialogs = $injector.get('dialogs');
    msg = this.translate(msg) || msg;
    title = this.translate(title) || title;
    if (msg) {
      // CS-14117: [CQ][IdM Console] The same error message should not be pop out repeatedly
      // there's already a error dialog there, just update the content.
      if ($('.dialog-header-error').length != 0) {
        $('.dialog-header-error').next().html(msg);
        return;
      }
      var dlg = dialogs.error(title || 'Error', msg);
      return dlg.result;
    }
  };
  
  this.lnotify = function(message, isError, title) {
    if (isError) {
      window.console.log('Error ' + message);
      this.error(message, title);
      return;
    }
    this.notify(message, title);
  };

  this.showDialog = function(url, data, controller, allowAnonymous) {
    this.hideSpinner();
    if (!allowAnonymous && !$injector.get('UserService').isUserLoggedIn()) return;
    var dialogs = $injector.get('dialogs');
    return dialogs.create(url, controller || 'IdMDialogController', data).result;
  };
  
  this.showSpinner = function(msg) {
    msg = this.translate(msg) || msg;
    blockUI.start(msg);
  };
  
  this.hideSpinner = function() {
    $timeout(function() {
      blockUI.reset();
    });
  };
  
  this.hasUrlParam = function(search, param, expect) {
    var actual = (search[param] || 'false') + '';
    expect = expect || 'true';
    return actual == expect;
  };
  
  this.getUrlParam = function(search, param, defval) {
    if (search[param] === true) {
      return defval;
    }
    return search[param] || defval;
  };

  this.toBoolean = function toBoolean(value) {
    if (value && value.length !== 0) {
      var v = ("" + value).toLowerCase();
      value = !(v == 'f' || v == '0' || v == 'false' || v == 'no' || v == 'n' || v == '[]');
    } else {
      value = false;
    }
    return value;
  };
  
  this.getToken = function(){
    return webStorage.get('authToken');
//    return 'PalmAuth token=superadmintoken';
  };
  
  this.queryToJson = function(queryString) {
    var pairs = queryString.split('&');
    var result = {};
    angular.forEach(pairs, function(pair) {
      pair = pair.split('=');
      result[pair[0]] = decodeURIComponent(pair[1] || '');
    });
    return result;
  };
  
  this.jsonToQuery = function(json) {
    var result = '';
    angular.forEach(json, function(v, k) {
      v = v.split('&').join(encodeURIComponent('&'));
      v = v.split('=').join(encodeURIComponent('='));
      result += '&' + k + '=' + v; 
    });
    return result.substring(1);
  };
  
  this.stringComparator = function(criteria, getter) {
    var self = this;
    return function(value) {
      if (criteria) {
        if (angular.isString(getter)) value = self.getProperty(value, getter);
        if (angular.isFunction(getter)) value = getter(value);
        value = ((value || '') + '').toLowerCase();
        criteria = (criteria || '').toLowerCase();
        return value.indexOf(criteria) != -1;
      }
      return true;
    };
  };
  

  // get property value by string like "prop1.prop2"
  // e.g. UtilService.getProperty(obj, 'prop1.prop2');
  this.getProperty = function(obj, property) {
    var fields = property.split(".");
    while (fields.length && (obj = obj[fields.shift()]));
    return obj;
  };
  
  this.stringGetter = function(getter) {
    return function(value) {
      if (angular.isString(getter)) value = value[getter];
      if (angular.isFunction(getter)) value = getter(value);
      return (value || '') + '';
    }
  };
  
  this.translate = function(transId) {
    var result = $translate.instant(transId);
    if (result != transId) return result;
    return null;
  };
  
  this.fnSelectAll = function($event, selected, available) {
    return function() {
      if ($event.target.checked) {
        $scope.data[selected] = $scope[available];
      } else {
        $scope.data[selected] = [];
      }
    };
  };
  
  this.compareString = function(str1, str2) {
    if (!angular.isString(str1)) {
      str1 = str1.toString();
    }
    if (!angular.isString(str2)) {
      str2 = str2.toString();
    }
    return str1.localeCompare(str2);
  };
  
  this.deferentRoles = function(role1, role2) {
    return _.reject(role1, function(toMatch) {
      return _.find(role2, function(role) {
        return (role.role.id == toMatch.role.id);
      });
    });
  };

  this.parseRelationshipErrorMessage = function (result, headerString) {
    result = angular.toJson(result);
    var message = [];
    if (result.indexOf('already exists') != -1) message.push('already exists');
    if (result.indexOf('not exist') != -1) message.push('not exist');
    if (result.indexOf('already removed') != -1) message.push('already removed');
    return headerString + message.join(' or ');
  };
  
})
.controller('IdMDialogController', function ($scope, $modalInstance, data) {
  
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
  
});
