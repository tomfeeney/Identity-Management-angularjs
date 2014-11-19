'use strict';

angular.module('IdMClientApp')
.factory('idmHttpErrorInterceptor', function($q, $location, webStorage, UtilService, ErrorMessageService) {
  
  var resolveHandled = function(handled, response) {
    if (!angular.isArray(handled)) return handled;
    if (_.contains(handled, response.data.JSONException.errorCodes)) {
      return true;
    }
    return false;
  };
  
  return function(promise) {
    return promise.then(
      function success(response) {
        
        var handled = false;
        if (response.config.message_config && response.config.message_config.message_handled) {
          handled = response.config.message_config.message_handled;
        }
        
        if (response.data.JSONException) {
          if (!resolveHandled(handled, response)) {
            UtilService.error(ErrorMessageService.resolveErrorMessage(response.data, response.config.message_config), ErrorMessageService.resolveTitle($location.path(), response.config.message_config));
            // token is invalid, redirect to login page.
            if (response.data.JSONException.errorCodes == 'PAMS1110') {
              webStorage.clear();
              $location.path('/login');
            }
          }
          return $q.reject(response);
        }
        
        if (response.data.errorCode) {
          if (!handled) {
            UtilService.error(response.data.errorDescription, response.data.error);
          }
          return $q.reject(response);
        }
        
        if (response.data.error) {
          if (!handled) {
            UtilService.error(response.data.error_description, response.data.error);
          }
          return $q.reject(response);
        }
        
        return response;
        
      },
      function error(response) {
        return response;
      }
    );
  };
})
.config(function($httpProvider) {
  $httpProvider.responseInterceptors.push('idmHttpErrorInterceptor');
})
.service('ErrorMessageService', function(UtilService) {
  
//  var errorMessages = {
//    /* errorCode: errorMessage */
//    'COMMON-012': 'Access denied due to insufficient permissions.',
//    'DUPLICATED_GROUP': 'Group name is in use',
//    'PAMS1137': 'The credentials you provided were not valid. Please try again.',
//    'PAMS1018': 'Answer is incorrect. Try again.',
//    'PAMS1100': 'Please recheck the email and password you\'ve provided, and try again.',
//    'PAMS1102': 'Please recheck the email and password you\'ve provided, and try again.',
//    'PAMS1008': 'Email address is already in use, please use another email address to continue.',
//    'PAMS1034': 'Email address is already in use, please use another email address to continue.',
//    'PAMS1005': 'Please recheck the email and password you\'ve provided, and try again.'
//  };
  
//  var titles = {
//    /* urlPath: title */
//    '/passwordreset': 'Password Reset',
//    '/roles': 'Role & Permission',
//    '/login': 'Sign In',
//    '/changepassword': 'Change Password'
//  }
  
  this.resolveErrorMessage = function(data, config) {
    if (config && config[data.JSONException.errorCodes]) return config[data.JSONException.errorCodes];
//    var msg = errorMessages[data.JSONException.errorCodes];
    var msg = UtilService.translate("error." + data.JSONException.errorCodes);
    if (msg) return msg;
    msg = data.JSONException.message;
    if (msg) return msg;
    return 'Service Unavailable';
  };
  
  this.resolveTitle = function(path, config) {
    if (config && config.title) return config.title;
//    var title = titles[path];
    var title = UtilService.translate("title." + path);
    if (title) return title;
    title = path.slice(1);
    if (title) return title;
  };
  
});