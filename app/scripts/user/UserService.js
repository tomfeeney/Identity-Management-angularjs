'use strict';

angular.module('IdMClientApp').service('UserService', function (ConfigService, ChallengeQuestionService, TokenGatewayService, SCRAMService, webStorage, $http) {

    var isUserLoggedIn = false;

    this.isUserLoggedIn = function () {
      return webStorage.get('isUserLoggedIn');
    };

    var accountId = '';

    var user = {
      firstName: '',
      lastName: '',
      email: '',
      language: '',
      country: '',
      postalCode: '',
      title: '',
      id: ''
    };


    this.getUser = function ($scope) {
      $http({
        method: 'GET',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/user?email=' + $scope.user.email + '&' + 'enterprise=' + $scope.authProvider,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
      }).success(function (data, status, headers, config) {
        $scope.user.firstName = data.AuthenticateInfoEx.accountInfo.firstName;
        $scope.user.lastName = data.AuthenticateInfoEx.accountInfo.lastName;
        $scope.user.country = data.AuthenticateInfoEx.accountInfo.country;
        $scope.user.postalCode = data.AuthenticateInfoEx.accountInfo.postalCode;
      });
    };

    this.getUserInfo = function(token, onSuccess, onFailure, messageConfig) {
      return $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/userInfo',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: { authToken: token },
        message_config: messageConfig
      }).success(function(data, status, headers, config) {
        onSuccess(data.AccountInfo);
      }).error(function () {
        onFailure();
      });
    };

    this.getUserInfoById = function(accountId, onSuccess, onFailure) {
      return $http({
        method: 'GET',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/getUserInfoById/' + accountId ,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
      }).success(function(data, status, headers, config) {
        if (data.OutAccountInformation) {
          onSuccess(data.OutAccountInformation);
        }
      });
    };

    this.userAggregate = function(token, email, onSuccess) {
      var payload = {
        token: token || webStorage.get('authToken'),
        email: email || webStorage.get('user').email
      };
      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/userAggregate',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: { InAccountInfoAggretate: payload }
      }).success(function (data, status, headers, config) {
        onSuccess(data.OutAccountInfoAggregate);
      });
    };

    // used by IdM
    this.registerScramUser = function(user, onSuccess, noFailure) {

      var email = user.user.email;
      var password = user.user.password;
      var authProvider = user.idProvider;

      SCRAMService.apply(email, password, authProvider, true, function(message) {
        user.user.password = message;
        registerStandaloneUser({ InUser: user }, function(data) {
          webStorage.add('user', data.user);
          webStorage.add('accountId', data.id);
          webStorage.add('isUserLoggedIn', true);
          user = data.user;
          data.authProvider = authProvider;
          onSuccess(data);
        });
      }, function(err) {
        noFailure(err);
      });

    };

    // deprecated!
    this.registerUser = function (payload, email, password, authProvider, notify, onSuccess, loginAgain) {

      registerStandaloneUser(payload, function(data) {
        data.user.challengeQuestion = ChallengeQuestionService.getChallengeQuestionById(angular.fromJson(payload).InUser.challengeQuestion.questionId);
        webStorage.add('user', data.user);
        webStorage.add('accountId', data.id);
        webStorage.add('isUserLoggedIn', true);
        user = data.user;
        notify('You have successfully created an account. Please verify the data and make changes if necessary.', false, 'Account Creation');
        onSuccess();
        loginAgain(email, password, authProvider, function () {}, function () {}, function () {});
      });

    };

    var registerStandaloneUser = function (payload, onSuccess) {

      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/user',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: payload,
        message_config: { title: 'Account Creation' }
      }).success(function (data, status, headers, config) {
        onSuccess(data);
      });

    };

    this.registerWebIdUser = function(authRequest, user, userPayload, onSuccess, onFailure) {

      var email = user.account.email;
      var password = user.password;
      var authProvider = user.idProvider;

      SCRAMService.apply(email, password, authProvider, true, function(message) {
        user.password = message;
        if (authRequest.deviceType == 'B') {
          registerWebIdBrowserUser(authRequest, user, onSuccess);
        } else if (authRequest.deviceType == 'D') {
          registerWebIdDeviceUser(authRequest, user, onSuccess);
        } else {
          var userInfo = angular.fromJson(userPayload);
          userInfo.user.password = message;
          userPayload = angular.toJson({"InUser":userInfo});
          registerStandaloneUser(userPayload, onSuccess);
        }
      }, function(err) {
        onFailure(err);
      });

    };

    var registerWebIdBrowserUser = function(authRequest, user, onSuccess) {
      user.browser = {
        platform: authRequest.devicePlatform,
        model: authRequest.deviceModel,
        version: authRequest.deviceOsVersion
      };
      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/browserUser',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: { InCreateBrowserAccount: user },
        message_config: { title: 'Sign Up' }
      }).success(function(data, status, headers, config) {
        onSuccess(data.AuthenticateInfoEx);
      });
    };

    var registerWebIdDeviceUser = function(authRequest, user, onSuccess) {
      user.idProviderPrefix = user.idProvider; delete user.idProvider;  // rename idProvider to idProviderPrefix
      user.genericDeviceInfo = {
        uniqueId: authRequest.deviceId,
        deviceModel: authRequest.deviceModel,
        deviceName: authRequest.deviceName,
        platformInfo: {
          osName: authRequest.devicePlatform,
          osVersion: authRequest.deviceOsVersion
        }
      };
      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/deviceUser',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: { InCreateDeviceAccount: user },
        message_config: { title: 'Sign Up' }
      }).success(function(data, status, headers, config) {
        onSuccess(data.OutAccountInformation);
      });
    };
    
    this.resetPassword = function (authProvider, emailAddress, notify, onSuccess, messageConfig) {

      var payload = JSON.stringify({
        'idProvider': authProvider,
        'email': emailAddress
      });

      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/forgotPassword',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: payload,
        message_config: messageConfig
      }).success(function (data, status, headers, config) {
        if (status === 200 && !data.JSONException) {
//            notify('Your password request was successfully processed.', false, 'Password Reset');
          onSuccess();
        } else if (status === 200 && data.JSONException) {
          notify(data.JSONException.message, true, 'Password Reset');
        }
      });
    };

    /**
     * HPwebId changePassword by Email Flow
     *
     */
    this.changeWebIdPassword = function(token, user, passwordNew, onSuccess, onFailure) {

      var email = user.email;
      var authProvider = user.idProvider;
      var self = this;

      SCRAMService.apply(email, passwordNew, authProvider, true, function(message) {
        async.waterfall([
          function(next) {
            TokenGatewayService.validateToken(token, function(result) {
              if (!_.contains(result.authorized_scopes, 'password_reset')) {
                onFailure("Don't have permission scope to reset password");
                return;
              }
              next(null, result);
            }, function(result) {
              onFailure('Token is invalid');
            });
          }, function(result, next) {
            self.resetWebIdPassword(result.account.accountInfo.id, message, onSuccess);
          }]);
      }, function(err) {
        onFailure(err.errorDescription);
      });

    };

    this.resetWebIdPassword = function(accountId, passwordNew, onSuccess) {
      var payload = {
          accountId: accountId,
          password: passwordNew
      };
      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/resetUserPassword',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: angular.toJson({ InResetAccountPassword: payload })
      }).success(function (data, status, headers, config) {
        onSuccess(data);
      });
    };

    /**
     * Idm changePassword by ChallangeQuestion Flow
     *
     */
    this.changePassword = function (authToken, email, authProvider, newPassword, onSuccess, onFailure){
      SCRAMService.apply(email, newPassword, authProvider, true, function(message) {
        changePasswordByQuestion(authToken, message, onSuccess, onFailure);
      });
    };

    var changePasswordByQuestion = function (authToken, newPassword, onSuccess, onFailure) {

      var payload = JSON.stringify({
        'InChangePassword': {
          'authToken': authToken,
          'newPassword': newPassword
        }});

      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/changePassword',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: payload,
        message_config: { title: 'Password Change' }
      }).success(function (data, status, headers, config) {
        if (status === 200 && !data.JSONException) {
          onSuccess();
        } else if (status === 200 && data.JSONException) {
          onFailure( { errorDescription: data.JSONException.message, title: 'Password Change' });
        }
      });
    };

    /**
     * Idm and HPwebId changePassword by old password Flow
     *
     */
    this.changeAccountPassword = function (token, email, authProvider, newPassword, oldPassword, onSuccess, onFailure) {

      async.waterfall([
        function(next) {
          SCRAMService.apply(email, newPassword, authProvider, true, function(newMessage) {
            next(null, newMessage);
          }, function(err) {
            next(err);
          });
        }, function(newMessage, next) {
//          next(null, newMessage, null);
          SCRAMService.apply(email, oldPassword, authProvider, false, function(oldMessage) {
            next(null, newMessage, oldMessage);
          }, function(err) {
            next(err);
          });
        }, function(newMessage, oldMessage, next) {
          doChangePassword(newMessage, oldMessage, onSuccess, function(err) {
            next(err);
          });
        }], function(err) {
          onFailure(err);
        });

      var doChangePassword = function (newPassword, oldPassword, onSuccess, onFailure) {

        var payload = JSON.stringify({
          "InChangeAccountPassword": {
            "authToken": token,
            "oldPassword": oldPassword,
            "newPassword": newPassword
          }});

        $http({
          method: 'POST',
          url: ConfigService.getEndpoint() + '/identitymanagement/services/changeAccountPassword',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
          data: payload,
          message_config: { title: 'Password Change' }
        }).success(function (data, status, headers, config) {
          if (status === 200 && data.JSONException) {
            onFailure( { errorDescription: data.JSONException.message, title: 'Password Change' });
          } else if ((status === 400) || (status === 500) || data.error) {
            onFailure( { errorDescription: data.error_cause, title: 'Password Change' });
          } else if (status === 200) {
            onSuccess();
          }
        });

      };

    };

    /**
     * Idm console log in flow
     */
    this.loginScram = function(email, password, authProvider, onSuccess, onError) {

      var doLogin = function(email, password, authProvider, onSuccess, onError) {

        var payload = {
          email: email,
          password: password,
          idProvider: authProvider
        };

        $http({
          method: 'POST',
          url: ConfigService.getEndpoint() + '/identitymanagement/services/login',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
          data: { Authorization: payload },
          message_config: { title: 'Account Sign in', message_handled: true }
        }).success(function (data, status, headers, config) {
          if (data.auth_token) {
            webStorage.add('user', data.user);
            webStorage.add('isUserLoggedIn', true);
            webStorage.add('authToken', data.auth_token);
            webStorage.add('enterpriseId', data.user.enterpriseId);
            webStorage.add('challengeQuestions', data.challengeQuestions);
            webStorage.add('accountType', data.user.type);
            onSuccess(data.auth_token);
            return;
          }
        }).error(function(data) {
          if (data.error) {
            if (data.error_cause.indexOf('Account locked') !== -1) {
              onError( { errorDescription: 'Please wait 15 minutes and try again or you can click the "I forgot my password" link to change your password.', title: 'Account Sign in' } );
            } else if (data.error_cause.indexOf('Invalid password') !== -1) {
              onError( { errorDescription: 'Please recheck the email and password you\'ve provided, and try again.', title: 'Account Sign in' } );
            } else {
              onError( { errorDescription: 'Invalid email address or invalid authentication provider.', title: 'Account Sign in' } );
            }
          }
        });
      };

      SCRAMService.apply(email, password, authProvider, { createSalt: false, application: 'TokenGateway' }, function(message) {
        doLogin(email, message, authProvider, onSuccess, onError);
      }, function(err) {
        err.title = 'Account Sign in';
        onError(err);
      });


    };
    
    this.loginOAuth = function (oauth, onSuccess, onFailure) {
      
      var self = this;
      
      TokenGatewayService.exchangeToken(oauth, function(token) {
        self.getAccountProfile(token.access_token, function(accountInfo) {
          onSuccess(accountInfo);
        }, onFailure);
      }, onFailure);

    };

    // seems nobody use it.
    this.login = function (email, password, authProvider, notify, onSuccess, onError) {

      var payload = JSON.stringify({
        'Authorization': {
          'email': email,
          'password': password,
          'idProvider': authProvider
        }
      });

      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/login',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: payload
      }).success(function (data, status, headers, config) {
        if (status === 200 && data.auth_token) {
          webStorage.add('user', data.user);
          webStorage.add('isUserLoggedIn', true);
          webStorage.add('authToken', data.auth_token);
          webStorage.add('enterpriseId', data.user.enterpriseId);
          webStorage.add('challengeQuestions', data.challengeQuestions);
          onSuccess();
        } else if ((status === 400) || (status === 401) || (status === 500) || data.error !== null) {
          if (data.error_cause.indexOf('Account locked') !== -1) {
            notify('Please wait 15 minutes and try again or you can click the "I forgot my password" link to change your password.', true, 'Account Sign in');
          } else if (data.error_cause.indexOf('Invalid password') !== -1) {
            notify('Invalid password.', true, 'Account Sign in');
          } else {
            notify('Invalid email address or invalid authentication provider.', true, 'Account Sign in');
          }
          onError({});
        } else if (status === 200 && data.JSONException) {
          notify(data.JSONException.message, true, 'Account Sign in');
        }
      });

    };

    /**
     * HPwebId console log in flow
     */
    this.loginWebId = function(noScram, authRequest, email, password, authProvider, onSuccess, onFailure) {

      if (noScram) {
        loginWebIdNoScramUser(authRequest, email, password, authProvider, onSuccess, onFailure);
      } else {
        SCRAMService.apply(email, password, authProvider, false, function(message) {
          return loginWebIdAuthenticateScramUser(authRequest, email, message, authProvider, onSuccess, onFailure);
        }, onFailure);
      }

    };
    
    var loginWebIdNoScramUser = function(authRequest, email, password, authProvider, onSuccess, onFailure) {
      
      // call profile manager to authenticate ------------------------
      // if device information is available from authrequest, then call authenticateFromGenericDevice
      if (authRequest.deviceType) {
        loginWebIdGenericDevice(authRequest, email, password, authProvider, onSuccess, onFailure);
      } else {
        loginWebIdAuthenticateUser(authRequest, email, password, authProvider, onSuccess, onFailure);
      }
      
    };

    var loginWebIdAuthenticateScramUser = function(authRequest, email, message, authProvider, onSuccess, onFailure) {

      var payload = {
        application: "HPWebID",
        message: message,
        idProvider: authProvider,
        accountAlias: email,
        browser: authRequest.deviceType === 'B'
      };
      if (authRequest.deviceType) {
        payload.genericDeviceInfo = {
          uniqueId: authRequest.deviceId,
          deviceModel: authRequest.deviceModel,
          deviceName: authRequest.deviceName,
          platformInfo: {
            osName: authRequest.devicePlatform,
            osVersion: authRequest.deviceOsVersion
          }
        };
      }

      return $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/loginScramUser',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: { InChallengeRequest: payload }
      }).success(function(data, status, headers, config) {
        if (data.OutChallengeResponse) {
          if (!SCRAMService.verify(data.OutChallengeResponse.message)) {
            onFailure({ errorDescription: 'Signature verification failed.' });
            return;
          }
          webStorage.add('user', data.OutChallengeResponse.accountInfo);
          webStorage.add('isUserLoggedIn', true);
//          webStorage.add('authToken', data.auth_token);
          webStorage.add('enterpriseId', data.OutChallengeResponse.enterpriseId);
//          webStorage.add('challengeQuestions', data.challengeQuestions);
          webStorage.add('accountInfo', data.OutChallengeResponse);
          onSuccess(data.OutChallengeResponse);
        }
      }).error(function() {
        onFailure();
      });

    };

    var loginWebIdGenericDevice = function(authRequest, email, password, authProvider, onSuccess, onFailure) {

      $http({
         method: 'POST',
         url: ConfigService.getEndpoint() + '/identitymanagement/services/loginGenericDevice',
         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
         data: toInAuthenticateFromDevice(authRequest, email, password, authProvider)
      }).success(function(data, status, headers, config) {
        if (data.OutAccountInformation) {
          webStorage.add('user', data.OutAccountInformation.accountInfo);
          webStorage.add('isUserLoggedIn', true);
//          webStorage.add('authToken', data.auth_token);
          webStorage.add('enterpriseId', data.OutAccountInformation.enterpriseId);
//          webStorage.add('challengeQuestions', data.challengeQuestions);
          webStorage.add('accountInfo', data.OutAccountInformation);
          onSuccess(data.OutAccountInformation);
        }
      }).error(function() {
        if (onFailure) onFailure();
      });

    };

    var loginWebIdAuthenticateUser = function(authRequest, email, password, authProvider, onSuccess, onFailure) {

      var payload = {
        accountAlias: email,
        password: password,
        idProvider: authProvider,
        browser: false
      }

      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/loginAuthenticateUser',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: { InAuthenticateFromDevice: payload }
     }).success(function(data, status, headers, config) {
       if (data.OutAccountInformation) {
         webStorage.add('user', data.OutAccountInformation.accountInfo);
         webStorage.add('isUserLoggedIn', true);
//         webStorage.add('authToken', data.auth_token);
         webStorage.add('enterpriseId', data.OutAccountInformation.enterpriseId);
//         webStorage.add('challengeQuestions', data.challengeQuestions);
         webStorage.add('accountInfo', data.OutAccountInformation);
         onSuccess(data.OutAccountInformation);
       }
     }).error(function() {
       if (onFailure) onFailure();
     });

    };

    var toInAuthenticateFromDevice = function(authRequest, email, password, authProvider) {

      var payload = {
        application: 'GramID',
        accountAlias: email,
        password: password,
        idProviderPrefix: authProvider,
        browser: authRequest.deviceType == 'B',
        genericDeviceInfo: {
          deviceModel: authRequest.deviceModel,
          platformInfo: {
            osName: authRequest.devicePlatform,
            osVersion: authRequest.deviceOsVersion
          }
        }
      };

      if (authRequest.deviceName) {
        payload.genericDeviceInfo.deviceName = authRequest.deviceName;
      }
      if (authRequest.deviceId) {
        payload.genericDeviceInfo.uniqueId = authRequest.deviceId;
      }

      return JSON.stringify({ InAuthenticateFromDevice: payload });

    };

    this.deleteUser = function (accountId, token, $location, notify) {

      var payload = JSON.stringify({
        'InDeleteUser': {
          'authToken': token,
          'accountId': accountId
        }
      });

      $http({
        method: 'DELETE',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/user',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: payload,
        message_config: { title: 'Delete Account' }
      }).success(function (data, status, headers, config) {
        if (status === 200 && !data.JSONException) {
          webStorage.clear();
          user = null;
          notify('Your account was successfully deleted.', false, 'Delete Account');
          $location.path('/login');
        } else if ((status === 400) || (status === 500)) {
          notify(data.error_cause, false);
        } else if (status === 200 && data.JSONException) {
          notify(data.JSONException.message, false, 'Delete Account');
        }
      });
    };

    this.updateUser = function (payload, newUser, notify, onSuccess) {

      $http({
        method: 'PUT',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/user',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: payload,
        message_config: { title: 'Account Profile Change' }
      }).success(function (data, status, headers, config) {
        if (status === 200 && !data.JSONException) {
          notify('Your account was successfully updated.', false, 'Account Confirmation');
          var user = webStorage.get('user');
          webStorage.add('user', angular.copy(newUser, user));
          onSuccess();
        } else if (status === 200 && data.JSONException) {
          notify(data.JSONException.message, true, 'Account Profile Change');
        } else if ((status === 400) || (status === 500) || data.error !== null) {
          notify(data.error_cause, false);
        }
      });
    };

    this.updateWebIdUser = function(token, user, onSuccess) {

      var payload = {
        authToken: token,
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          language: user.language,
          country: user.country,
          title: user.title
        }
      };

      $http({
        method: 'PUT',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/user',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: { InUpdateUser: payload },
        message_config: { title: 'Account Profile Change' }
      }).success(function (data, status, headers, config) {
        onSuccess(user);
      });

    };

    this.logout = function () {
      webStorage.clear();
    };

    this.changeEmailAddress = function (authToken, newUser, notify, onSuccess) {

      var payload = JSON.stringify({
        "InChangeEmailAddress": {
          "authToken": authToken || webStorage.get('authToken'),
          "newEmailAddress": newUser.email
        }});

      $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/changeEmailAddress',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: payload,
        message_config: { title: 'Email Address Change' }
      }).success(function (data, status, headers, config) {
        if (status === 200 && data.JSONException) {
          notify(data.JSONException.message, false);
        } else if ((status === 400) || (status === 500)) {
          notify(data.error_cause, false);
        } else if (status === 200) {
          notify('Email address change has been initiated. A verification email has been sent to the new and the old email address', false, 'Email Address Change');
        }
        if (onSuccess) onSuccess();
      });
    };

  this.verifyEmail = function(authToken, oldEmail, onSuccess, onFailure) {
    var self = this;
    async.waterfall([
      function(next) {
        self.getUserInfo(authToken, function(accountInfo) {
          if (accountInfo.accountState === 'B') {
            onFailure('emailconfirmed');
          } else {
            next();
          }
        },function() {
          onFailure();
        }, { message_handled: true });
      },
      function(next) {
        self.doVerifyEmail(authToken, oldEmail, onSuccess, onFailure);
      }
    ], function(err, results) {
      onSuccess(results);
    });
  };

    this.doVerifyEmail = function(authToken, oldEmail, onSuccess, onFailure) {
      
      var config;
      var payload;
      if (oldEmail) {
        config = {
          method: 'POST',
          url: ConfigService.getEndpoint() + '/identitymanagement/services/confirmEmailChange',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
          data: { verifyToken: authToken },
          message_config: { message_handled: true }
        };
      } else {
        payload = {
          "trustedToken": "user_console_ext",
          "verificationToken": authToken
        };
        config = {
          method: 'POST',
          url: ConfigService.getEndpoint() + '/identitymanagement/services/verifyEmail',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
          data: { InVerifyEmail : payload },
          message_config: { message_handled: true }
        };
      }

      return $http(config).success(function(data, status, headers, config) {
        
//        RESPONSE EXAMPLE-----------------------------------------------------
//          "AccountInfoEx": { 
//            "country": "US",
//            "email": "test02232@hp.com",
//            "firstName": "Test",
//            "hasCR": false,
//            "id": "aa105a43-7d75-11e2-a504-643150261bd9",
//            "language": "en",
//            "lastName": 1, 
//            "postalCode": "" } 
        
          if (oldEmail) {
            onSuccess(data.AccountInfo);
          } else {
            onSuccess(data.AccountInfoEx);
          }

        }).error(function() {
          onFailure();
        });
    };
    
    this.resendVerificationEmail = function(onSuccess, onFailure) {
      
      var token = webStorage.get('authToken');
      
      return $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/resendVerificationEmail',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: { authToken: token }
      }).success(function(data, status, headers, config) {
        onSuccess();
      }).error(function() {
        if (onFailure) onFailure();
      });
      
    };

    this.getAccountProfile = function(authToken, onSuccess, onFailure) {
      
      authToken = authToken || webStorage.get('authToken');

      return $http({
        method: 'POST',
        url: ConfigService.getEndpoint() + '/identitymanagement/services/userProfile',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
        data: { authenToken: authToken }
      }).success(function(data, status, headers, config) {
        webStorage.add('user', data.OutAccountInformation.accountInfo);
        webStorage.add('accountInfo', data.OutAccountInformation);
        webStorage.add('isUserLoggedIn', true);
        webStorage.add('enterpriseId', data.OutAccountInformation.enterpriseId);
        webStorage.add('idProvider', data.OutAccountInformation.accountInfo.idProvider);
        onSuccess(data.OutAccountInformation);
      }).error(function() {
        if (onFailure) onFailure();
      });
      
    };

  this.enableUser = function(email, token, idprovider, onSuccess) {
    var payload = {
      "idProvider": idprovider,
      "emailAddress": email,
      "token":token
    };
    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/deviceJ/enableAccount',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
      data: { InEmailAddress: payload }
    }).success(function (data, status, headers, config) {
      onSuccess();
    });
  };

});


