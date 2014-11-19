'use strict';

angular.module('IdMClientApp').controller('TokenExchangeController', function($scope, $location, UtilService, TokenGatewayService, WebIdService) {

  $scope.initTokenExchange = function() {
    var query = parseQueries();
    if (!query) {
      return;
    }
    TokenGatewayService.exchangeProviderToken(query, onSuccess, onFailure);
  };

  function onSuccess(data) {
    var query = parseQueries();
    if (!query) {
      return;
    }
    var redirectUri = URI(query.redirect_uri);
    redirectUri.search({ 'code': data.code });
    WebIdService.oAuthTokenRedirect(redirectUri.href());
  }
  
  function onFailure(err) {
    var query = parseQueries();
    if (!query) {
      return;
    }
    if (!query.redirect_uri) {
      WebIdService.messageRedirect('Cannot find redirect_uri!');
      return;
    }
    // decodeURIComponent is needed when use queryString because browser will encode it automatically
    var redirectUri = URI(decodeURIComponent(query.redirect_uri));
    redirectUri.setSearch({ 'state': query.state });
    redirectUri.setSearch({ 'error': 'token_exchange_failed' });
    if (err && err.error) {
      if (err.error == "invalid_token") {
        // token invalid, 302 redirect.
        WebIdService.oAuthTokenRedirect(err.error_description);
        return;
      }
      redirectUri.setSearch({ 'error': err.error });
    };
    if (err && err.errorCode) {
      redirectUri.setSearch({ 'error': err.errorCode });
    }
    WebIdService.oAuthTokenRedirect(redirectUri.href());
  }
  
  function parseQueries() {

    if ($.browser.msie && $.browser.version == '9.0') {
      var query = $location.url().substr(1);
      var state = $location.url().substr($location.url().substr(1).indexOf('state=') + 6);
    } else {
      var query = $location.hash();
      var state = $location.url().substr($location.url().indexOf('state=') + 6);
    }
    if (_.isEmpty(query)) {
      WebIdService.messageRedirect('Hash Parameters are required!');
      return null;
    }
    query = query.replace('state=', '');
    query = URI.parseQuery(query);
    query.oauth2_session_key = encodeURIComponent(query.oauth2_session_key); // FIX: CS-15068, encode again
    query.state = state;
    return query;
  };
  
});