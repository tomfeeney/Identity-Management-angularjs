'use strict';

angular.module('IdMClientApp').service('WebIdService', function ($location, $window, webStorage, UtilService) {
  
  var DEFAULT_OAUTH2_URI = 'urn:ietf:wg:oauth:2.0:oob';
  
  this.gettingToken = function(authRequest) {
    if (authRequest) return authRequest.responseType == 'token';
    return true;
  };
  var gettingToken = this.gettingToken;
  
  var addError = function(authRequest, redirect, error) {
    var params = { error: error };
    if (authRequest.state) params.state = authRequest.state;
    if (authRequest.dateSource) params.dateSource = authRequest.dateSource;
    params = $.param(params);
    return gettingToken(authRequest) ?
      redirect + '#' + decodeURIComponent(params) :
      redirect + '?'+ params;
  };

  var addResult = function(authRequest, redirect, result) {
    if (authRequest.state) result.state = authRequest.state;
    if (authRequest.dateSource) result.dateSource = authRequest.dateSource;
    var params = $.param(result);
    return gettingToken(authRequest) ?
      redirect + '#' + decodeURIComponent(params) :
      redirect + '?' + params;
  };

  var redirectTo = function(authRequest, error, result) {
    var redirect = '/result';
    if (authRequest.redirectUri != DEFAULT_OAUTH2_URI) {
      redirect = authRequest.redirectUri;
    }      
    if (error) redirect = addError(authRequest, redirect, error);
    if (result) redirect = addResult(authRequest, redirect, result);

    if (authRequest.redirectUri != DEFAULT_OAUTH2_URI) {
      $window.location.replace(redirect);
    } else {
//      $location.url(redirect, true);
      UtilService.hideSpinner();
      $window.location.replace('/webid/#' + redirect);
    }
  };
  
  this.cancelRedirect = function(authRequest) {
    authRequest = authRequest || {
      redirectUri: DEFAULT_OAUTH2_URI,
      responseType: 'token'
    };
    redirectTo(authRequest, 'user_cancelled');
  };
  
  this.resultRedirect = function(authRequest, result) {
    authRequest = authRequest || {
      redirectUri: DEFAULT_OAUTH2_URI,
      responseType: 'token'
    };
    result = result || 'succeed';
    redirectTo(authRequest, null, { result: result });
  };
  
  this.denyRedirect = function(authRequest) {
    redirectTo(authRequest, 'access_denied');
  };
  
  this.tokenRedirect = function(token, authRequest, accountInfo) {
    token.email = accountInfo.accountInfo.email;
    redirectTo(authRequest, null, token);
  };
  
  this.authCodeRedirect = function(authCode, authRequest, accountInfo) {
    redirectTo(authRequest, null, {
      code: authCode,
      email: accountInfo.accountInfo.email
    });
  };

  this.oAuthTokenRedirect = function(redirectTo) {
    UtilService.hideSpinner();
    $window.location.replace(redirectTo);
  };
  
  this.messageRedirect = function(message) {
    UtilService.hideSpinner();
    $window.location.replace('/webid/#/message?message=' + message);
  };

});