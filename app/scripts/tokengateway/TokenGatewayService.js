'use strict';

angular.module('IdMClientApp').service('TokenGatewayService', function ($http, webStorage, ConfigService, WebIdService) {

    var grantFlows = {
      'anonymous_credentials': 'Anonymous Token',
      'authorization_code': 'Authorization Code',
      'client_credentials': 'Client Credentials',
      'pairing_code': 'Device Pairing',
      'external_credentials': 'External credentials',
      'implicit_grant': 'Implicit Grant',
      'password': 'Password',
      'urn:ietf:params:oauth:grant-type:saml2-bearer': 'SAML'
    };

    var clientTypes = ['browser', 'mobile', 'service', 'device'];
    var localeCodes = ['en_US', 'ru_RU', 'ro_RO'];

    var getClientToken = function(next) {
      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/'+ webStorage.get('idProvider') + '/token',
      }).success(function (data, status, headers, config) {
        next(null, data.access_token);
      }).error(function() {
      });
    };

    this.getLocaleCodes = function() {
      return localeCodes;
    };

    this.getGrantFlows = function() {
      return grantFlows;
    };

    this.getClientTypes = function() {
      return clientTypes;
    };

    var toClientJson = function (payload) {
      payload = angular.fromJson(payload);
      if (angular.isString(payload.clientInfo.redirectUris)) {
        payload.clientInfo.redirectUris = _.compact(payload.clientInfo.redirectUris.split(/[ ,]+/));
      }
      if (_.isEmpty(payload.clientInfo.redirectUris)) {
        payload.clientInfo.redirectUris = [];
      }
      return JSON.stringify(payload);
    };
  
    this.addClient = function (clientNew, onSuccess) {
      var payload = toClientJson(clientNew);


      var self = this;
      async.waterfall([

        function(next) {
          getClientToken(next);
        },

        function(clientAccessToken, next) {
          $http({
            method: 'POST',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/registration/generic/clients',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': 'bearer '+clientAccessToken },
            data: payload
          }).then(function (data, status, headers, config) {
            if (data.data.clientId) {
              next("Client successfully added.");
            } else if (data.data.error) {
              next(data.error_description+data.error_cause, true);
            }
          }, function(data, status, headers, config) {
              next(data.data.error_description+data.data.error_cause, true);
          })
        }

      ], function(results, isError) {
        onSuccess(results, isError);
      });
    };


    this.updateClient = function (clientUpdate, onSuccess) {
      var payload = toClientJson(clientUpdate);
      var self = this;
      async.waterfall([

        function(next) {
          getClientToken(next);
        },

        function(clientAccessToken, next) {
          $http({
            method: 'PUT',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/registration/generic/client',
            headers: {'Authorization': 'bearer '+clientAccessToken },
            data: payload
          }).success(function (data, status, headers, config) {
            if (status == '200') {
              next("Client successfully updated.");
            } else if (data.error) {
              next(data.error_description);
            }
          });
        }

      ], function(results) {
        onSuccess(results);
      });

    };


    this.removeClient = function (client, onSuccess) {
      var self = this;
      async.waterfall([

        function(next) {
          getClientToken(next);
        },

        function(clientAccessToken, next) {
          $http({
            method: 'DELETE',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/registration/generic/client/' + client.clientId,
            headers: {'Authorization': 'bearer '+clientAccessToken },
          }).success(function (data, status, headers, config) {
            if (status === 200) {
              next("Client successfully removed");
            } else if (data.error) {
              next(data.error + " " + data.error_cause);
            }
          });
        }

      ], function(results) {
        onSuccess(results);
      });

    };

    this.getClients = function (startNr, limitNr, searchStr, onSuccess, onFailure) {
      var self = this;
      async.waterfall([

        function(next) {
          getClientToken(next);
        },

        function(clientAccessToken, next) {
          $http({
            method: 'POST',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/registration/generic/search?start=' + startNr + 
                                               '&limit='+limitNr,
            data: {
                  "searchInfo" : {
                    "clientId" : searchStr || "",
                    "sortFields" : ["clientId"]
                  }
            },
            headers: {'Authorization': 'bearer '+clientAccessToken }
          }).success(function (data, status, headers, config) {
            if (data.searchList) {
              next(false, data.searchList);
            } else {
              next(false, []);
            }
          }).error(function() {
            if (onFailure) next(true);
        });
        }

      ], function(isError, results) {
        if (!isError) {
          onSuccess(results);
        } else {
          onFailure();
        }
      });

  };

  this.getPermissions = function (onSuccess, onFailure) {
      var self = this;
      async.waterfall([

        function(next) {
          getClientToken(next);
        },

        function(clientAccessToken, next) {
          $http({
            method: 'GET',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/registration/generic/permissions',
            headers: {'Authorization': 'bearer '+clientAccessToken }
          }).success(function (data, status, headers, config) {
            if (data.permissions) {
              next(false, data.permissions);
            } else {
              next(false, []);
            }
          }).error(function() {
            if (onFailure) next(true);
        });
        }

      ], function(isError, results) {
        if (!isError) {
          onSuccess(results);
        } else {
          onFailure();
        }
      });

  };

  this.getWebIdAuthRequest = function (webIdRequest, onSuccess, onError) {
    return $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/interactions/cachecontrol/authrequest/' + encodeURIComponent(webIdRequest.oauth2_session_key),
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
    }).success(function (data, status, headers, config) {
      onSuccess(data);
    });
  };
  
  this.deleteWebIdAuthRequest = function(webIdRequest, onSuccess) {
    $http({
      method: 'DELETE',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/interactions/cachecontrol/authrequest/' + encodeURIComponent(webIdRequest.oauth2_session_key),
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
    }).success(function (data, status, headers, config) {
      if (onSuccess) onSuccess();
    });
  };
  
  this.retrieveWebIdAuthRequest = function(webIdRequest, onSuccess) {
    var self = this;
    async.waterfall([
      function(next) {
        self.getWebIdAuthRequest(webIdRequest, function(authRequest) {
          next(null, authRequest);
        });
      },
      function(authRequest, next) {
        self.deleteWebIdAuthRequest(webIdRequest, function() {
          next(null, authRequest);
        });
      }
    ], function(err, results) {
      onSuccess(results);
    });
  };
  
  var getLoginSession = function(authRequest) {
    
    var user = webStorage.get('user');
    var enterpriseId = webStorage.get('enterpriseId');
    var scopes = webStorage.get('accountInfo').permissions;
    var devices =  webStorage.get('accountInfo').devices;
    
    var internalId = "";
    if (authRequest.deviceType != null) {
      var deviceId = authRequest.deviceId;
      var browserDeviceType = authRequest.deviceType == "B";
      if (devices != null) {
        for (var i = 0, l = devices.length; i < l; i++) {
          var device = devices[i];
          if (browserDeviceType) {
            if (device.browser) {
              internalId = device.id;
              break;
            }
          } else if (deviceId != null && (new RegExp(deviceId, 'i')).test(device.uniqueId)) {
            internalId = device.id;
            break;
          }
        }
      }
    }
    
    return {
      accountId: user.id,
      enterpriseId: enterpriseId,
      browserDeviceId: internalId,
      userScopes: scopes
    };
    
  };
  
  var toGrantPayload = function(authRequest) {
    return JSON.stringify({ 
      authRequest: authRequest,
      loginSession: getLoginSession(authRequest)
    });
  };
  
  this.getAuthGranted = function(authRequest, onSuccess) {
    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/interactions/authflow/authgranted',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
      data: toGrantPayload(authRequest)
    }).success(function(data, status, headers, config) {
      onSuccess(data.granted);
    });
  };
  
  var toAuthFormDataPayload = function(authRequest) {
    var user = webStorage.get('user');
    var locale = [user.language, user.country].join('_');
    return JSON.stringify({ 
      authRequest: authRequest,
      locale: locale
    });
  };
  
  this.getAuthFormData = function(authRequest, onSuccess) {
    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/interactions/authflow/authformdata',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
      data: toAuthFormDataPayload(authRequest)
    }).success(function(data, status, headers, config) {
      onSuccess(data);
    });
  };
  
  this.grantAccessAndRedirect = function(authRequest, accountInfo) {
    var self = this;
    async.waterfall([
      function(next) {
        // Step 1: get authcode or implicit token depending on the requestType
        self.grantAccess(authRequest, function(codeOrToken, isToken) {
          next(null, codeOrToken, isToken);
        });
      }, function(codeOrToken, isToken, next) {
        // Step 2: send back codeOrToken and clean authRequest
        if (isToken) {
          WebIdService.tokenRedirect(codeOrToken, authRequest, accountInfo);
        } else {
          WebIdService.authCodeRedirect(codeOrToken, authRequest, accountInfo);
        }
        self.deleteWebIdAuthRequest(authRequest);
      }
    ]);
  };
  
  this.denyAccessAndRedirect = function(authRequest) {
    this.deleteWebIdAuthRequest(authRequest, function() {
      WebIdService.denyRedirect(authRequest);
    });
  };
  
  this.grantAccess = function(authRequest, onSuccess) {
    if (WebIdService.gettingToken(authRequest)) {
      getImplicitToken(authRequest, onSuccess);
    } else {
      getAuthenticationCode(authRequest, onSuccess);
    }
  };
  
  var getAuthenticationCode = function(authRequest, onSuccess) {
    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/interactions/authflow/authcode',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
      data: toGrantPayload(authRequest)
    }).success(function(data, status, headers, config) {
      onSuccess(data.code, false);
    });
  };
  
  var getImplicitToken = function(authRequest, onSuccess) {
    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/interactions/authflow/implicittoken',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
      data: toGrantPayload(authRequest)
    }).success(function(data, status, headers, config) {
      onSuccess(data, true);
    });
  };

  this.validateToken = function(token, onSuccess, onFailure) {
    $http({
      method: 'GET',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/internal/getvalidationinfo',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache', 'Authorization': 'bearer ' + token }
    }).success(function (data, status, headers, config) {
      if (data.isValid) {
        onSuccess(data);
      } else {
        onFailure(data);
      }
    });
  };
  
  this.revokeToken = function(token, onSuccess) {
    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/tokenutils/revoke',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
      data: angular.toJson({ token: token })
    }).success(function(data, status, headers, config) {
      onSuccess(data);
    });
  };
  
  
  this.exchangeToken = function(oauth, onSuccess, onFailure) {
    
    var payload = {
      access_token: oauth.response.access_token,
      provider: oauth.provider
    };

    return $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/exchangeToken',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      data: payload
    }).success(function(data, status, headers, config) {
      onSuccess(data);
    }).error(function() {
      onFailure();
    });

  };

  this.exchangeProviderToken = function(query, onSuccess, onFailure) {
    
    return $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/exchangeProviderToken',
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', 'X-HP-Client-Id': query.client_id },
      data: query,
      message_config: { message_handled: true }
    }).success(function(data, status, headers, config) {
      if (data.code) {
        onSuccess(data);
      } else {
        if (onFailure) onFailure();
      }
    }).error(function(data) {
      if (onFailure) onFailure(data);
    });

  };
});