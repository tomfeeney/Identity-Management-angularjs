'use strict';

angular.module('IdMClientApp').controller('UserController', function ($scope, $location, $timeout, UtilService, IdMConfig, ConfigService, UserService, CountryService, LanguageService, ChallengeQuestionService, EnterpriseService, TokenGatewayService, WebIdService, webStorage) {
  
    var isUserLoggedIn = true;

    var loadAuthProviders = function() {
      EnterpriseService.getAuthProviders(function(authProviders) {
        $scope.authProviders = authProviders;
        if ($scope.WebIdMode) {
          $scope.authProvider = $scope.WebIdRequest ? $scope.WebIdRequest.provider || 'HP' : 'HP';
        } else {
          $scope.authProvider = 'HP';
        }
      }, notify);
    };

    $scope.initSignUp = function () {

        $scope.countries = CountryService.getCountries();
        $scope.country = CountryService.getDefaultCountry().code;
        $scope.languages = LanguageService.getLanguages();
        $scope.language = LanguageService.getDefaultLanguage().code;

        ChallengeQuestionService.getChallengeQuestions(function(challengeQs) {
          $scope.challengeQuestions = challengeQs;
          $scope.challengeQuestion = challengeQs[0].id;
        });
        loadAuthProviders();
        UserService.logout();
        
        $scope.optname = ($location.search().option == 'optname');

    };
    
    $scope.initWebIdSignUp = function () {

      $scope.countries = CountryService.getCountries();
      $scope.country = CountryService.getDefaultCountry().code;
      $scope.languages = LanguageService.getLanguages();
      $scope.language = LanguageService.getDefaultLanguage().code;

      ChallengeQuestionService.getChallengeQuestions(function(challengeQs) {
        $scope.challengeQuestions = challengeQs;
        $scope.challengeQuestion = challengeQs[0].id;
      });
      loadAuthProviders();
      UserService.logout();
      
      $scope.optname = ($location.search().option == 'optname');
      
      $scope.user = angular.extend($scope.user || {}, {
        firstName: $location.search().first_name,
        lastName: $location.search().last_name,
        email: $location.search().email
      });

    };
    
    $scope.editEnabled = function(field) {
      if (UtilService.getUrlParam($location.search(), 'edit_provided') == 'false') {
        if ($scope.user[field]) return false;
      }
      return true;
    }

    $scope.initLogin = function() {

      $scope.angular_style_2 = false;
      $scope.angular_style_1 = true;

      var isUserLoggedIn = true;
      loadAuthProviders();
      $scope.loadEmailFromToken();
    };

    $scope.initWebIdLogin = function() {
//      var locale = ($location.search()).locale;
//      if (locale) {
//        $translate.use(locale);
//        webStorage.add("locale", locale);
//      }
      $scope.angular_style_2 = false;
      $scope.angular_style_1 = true;

      $scope.authProvider = $location.search().provider;
      $scope.loadEmailFromToken();
    };
    
    $scope.loadEmailFromToken = function() {
      $scope.emailReadonly = false;
      if ($location.search().userid) {
        $scope.emailReadonly = true;
        UserService.getUserInfo($location.search().userid, function success(accountInfo) {
          $scope.email = accountInfo.email;
          if($scope.resetPassword) {
            $scope.resetPassword.email = accountInfo.email;
          }
        });
      }
    };

    $scope.initProfile = function () {

        var user = webStorage.get('user');

        if (user) {
            $scope.user = user;

            $scope.countries = CountryService.getCountries();
            $scope.languages = LanguageService.getLanguages();
            ChallengeQuestionService.getChallengeQuestions(function(challengeQs) {
              $scope.challengeQuestions = challengeQs;
            });

            $scope.authProvider = webStorage.get('idProvider');

        } else {
            $location.path('/login');
        }
    };

    $scope.initResetPassword = function() {
      $scope.resetPassword = {
        authProvider: 'HP',
        challengeQuestion: 'Loading security question'
      };
      EnterpriseService.getAuthProviders(function(authProviders) {
        $scope.authProviders = authProviders;
      }, notify);
    };

    $scope.initEmailConfirm = function() {
      $scope.confirmShow = "verifying";
      $scope.oldEmail = $location.search().oldEmail;

      var authtoken = $location.search().token;
      UserService.verifyEmail(authtoken, $scope.oldEmail, function(userInfo) {
        $scope.email = userInfo.email;
        if ($scope.oldEmail) {
          $scope.confirmShow = "confirmEmail";
          webStorage.prefix('');
          UserService.logout();
        } else {
          $scope.confirmShow = "verifyEmail";
        }
      }, function(error) {
        if (error == 'emailconfirmed') {
          $scope.confirmShow = 'alreadyVerified';
        } else {
          $scope.confirmShow = "error";
        }
      });
    };

    var setWebIdMessage = function(msg) {
      $scope.webIdMessage = msg;
    };

    $scope.initResetWebIdPassword = function() {
      $scope.resetPassword = {};
      setWebIdMessage('Validating token...');
      UserService.getUserInfo($location.search().token, function(result) {
        $scope.account = result;
        ConfigService.resetNoScram(result.idProvider, $location.search().noScram == 'true');
        $scope.resetWiz.showNextStep();
      }, function(err) {
        setWebIdMessage('Invalid token provided. Please try again.');
      }, { message_handled:['PAMS1110']});
    };

    $scope.initEditProfile = function () {
        $scope.editUser = angular.copy($scope.user);
    };

    $scope.isUserLoggedIn = function () {
        if (isUserLoggedIn) {
            return true;
        } else {
            return false;
        }
    };

    $scope.registerUser = function () {
        UtilService.showSpinner("Signing Up...");
        // Register the user and let the user login automatically
        if ($scope.WebIdMode) {
          UserService.registerWebIdUser($scope.WebIdAuthRequest, getWebIdUser(), getUserPayLoad('WEBID_AUTOGENERATED'), function(account) {
            $scope.login($scope.user.email, $scope.user.password);
          }, function(err) {
            notify(err.errorDescription, true, err.title);
          });
        } else {
          ConfigService.resetNoScram($scope.authProvider);
          UserService.registerScramUser(getUserPayLoad(null, false), function(data) {
            webStorage.add('idProvider', data.authProvider);
//            notify('You have successfully created an account. Please verify the data and make changes if necessary.', false, 'Account Creation');
            $scope.login($scope.user.email, $scope.user.password);
          }, function(err) {
            notify(err.errorDescription, true, err.title);
          });
//          UserService.registerUser(getUserPayLoad(), $scope.user.email, $scope.user.password, $scope.authProvider, notify, onSuccess, function(email, password,authProvider,notify,onSuccess,OnError) {
//              webStorage.add('idProvider', authProvider);
//              UserService.login(email, password, authProvider, notify, onSuccess, onError);
//          });
        }
    };

    /**
     * Idm changePassword by ChallangeQuestion Flow
     *
     */
    $scope.commitResetPassword = function () {
      UtilService.showSpinner('Resetting password...');
      ConfigService.resetNoScram($scope.resetPassword.authProvider);
      UserService.changePassword($scope.resetPassword.authToken, $scope.resetPassword.email, $scope.resetPassword.authProvider, $scope.resetPassword.passwordNew, function() {
        notify('Your password was successfully changed.', false, 'Password Change');
        $location.path('/login');
      }, function(err) {
        notify(err.errorDescription, true, err.title);
      });
    };

    /**
     * HP WebID Forget password
     */
    $scope.webIdResetPassword = function() {
      UserService.resetPassword($scope.WebIdRequest ? $scope.WebIdRequest.provider || 'HP' : 'HP', $scope.resetPassword.email, notify, function() {
        $scope.resetWiz.showNextStep();
      }, { 'PAMS1137': 'Email address is not a registered HP Web ID.' });
    };

    $scope.commitWebIdResetPassword = function() {
      if(!$scope.WebIdMode) {
        ConfigService.resetNoScram($scope.resetPassword.authProvider);
      }
      UtilService.showSpinner('Resetting password...');
      UserService.changeWebIdPassword($location.search().token, $scope.account, $scope.resetPassword.passwordNew, function() {
        
        var redirectUri = $location.search().redirect_uri;
        if (angular.isString(redirectUri)) {
          WebIdService.oAuthTokenRedirect(redirectUri);
          return;
        }
        
        UtilService.hideSpinner();
        $scope.resetWiz.showNextStep();
        // DANGER!!! must force reset the noScramVal if there're further actions.
        
      }, function(err) {
        UtilService.notify(err);
      });
    };

    var challengeQuestionLoaded = false;
    var challengeQuestionAuthed = false;

    $scope.beforeStepChange = function(stepEvent) {

      if (stepEvent.toStep == 1) { // Entering challenge question step
        if (challengeQuestionLoaded) return;
        ChallengeQuestionService.getChallengeQ(getChallengeQPayload($scope.resetPassword), notify, function(challengeQs) {
            $scope.resetPassword.challengeQuestion = challengeQs.question;
            $scope.resetPassword.challengeQuestionId = challengeQs.id;
            challengeQuestionLoaded = true;
            $scope.resetWiz.showNextStep(); // manually show next step
        });
        return false; // stop show next step, switch to manual mode.
      }

      if (stepEvent.fromStep == 1) { // Leaving challenge question step
        if (challengeQuestionAuthed) return;
        ChallengeQuestionService.authenticateChallengeQ(getAuthChallengeQPayload($scope.resetPassword), notify, function(authInfo) {
          challengeQuestionAuthed = true;
          $scope.resetPassword.accountId = authInfo.accountId;
          $scope.resetPassword.accountState = authInfo.accountState;
          $scope.resetPassword.authToken = authInfo.token;
          $scope.resetWiz.showNextStep(); // manually show next step
        }).then(function success(response) {}, function error(response) {
          if (response.data.JSONException.errorCodes == "PAMS1101") {
            // security question answered failed 3 times, account locked
            UserService.resetPassword($scope.resetPassword.authProvider, $scope.resetPassword.email, notify, function() {
              notify('Your account has been locked because you\'ve answered the question failed 3 times! Please check your inbox and follow the instructions', false);
              $location.path('/login');
            });
          }
        });
        return false; // stop show next step, switch to manual mode.
      }

    };

    $scope.cancelResetPassword = function() {
      $location.path('/login');
    };

    $scope.cancelWebId = function() {
      WebIdService.cancelRedirect($scope.WebIdAuthRequest);
    };

    $scope.deleteUser = function () {
      UtilService.confirm('Do you really want to delete the account?', 'Delete Account').then(function yes() {
        var accountId = webStorage.get('user').id;
        var token =  webStorage.get('authToken');
        if(accountId && token) {
            UserService.deleteUser(accountId, token, $location, notify);
        } else {
            notify('Please re-login to delete your account profile');
        }
      });
    };

    $scope.login = function (email, password) {

        var email = $scope.email || email;
        var password = $scope.password || password;
        var authProvider = $scope.authProvider;

        webStorage.add('idProvider', authProvider);
        
        UtilService.showSpinner("spinner.signing_in");
        if ($scope.WebIdMode) {
          UserService.loginWebId($scope.noScram, $scope.WebIdAuthRequest, email, password, authProvider, function(accountInfo) {
            $scope.password = '';
            $scope.granting = true;
//            UtilService.hideSpinner();
//            $location.path('/grant');
            TokenGatewayService.grantAccessAndRedirect($scope.WebIdAuthRequest, accountInfo);
          }, function(err) {
            UtilService.hideSpinner();
            if (err) { UtilService.error(err.errorDescription); }
//            $scope.email = '';
            $scope.password = '';
          });
        } else {
          ConfigService.resetNoScram(authProvider);
          UserService.loginScram(email, password, authProvider, onSuccess, function(e) {
            UtilService.hideSpinner();
            notify(e.errorDescription, true, e.title);
            $scope.password = '';
          });
        }
    };

    function onSuccess() {
      UtilService.hideSpinner();
      $location.path('/profile');
    }

    function onError() {
      webStorage.clear();
      $location.path('/login');
    }

    function notify(message, isError, title) {
      UtilService.hideSpinner();
      if (isError) {
        window.console.log('Error ' + message);
        UtilService.error(message, title);
        return;
      }
      UtilService.notify(message, title);
    }

    function getWebIdUser() {
      return {
        idProvider: $scope.authProvider,
        account: {
          'email': $scope.user.email,
          'firstName': $scope.user.firstName,
          'lastName': $scope.user.lastName,
          'language': $scope.language,
          'country': $scope.country,
          'title': $scope.user.title,
          'postalCode': ''
        },
        password: $scope.user.password,
        response: {
            'questionID': 1001,
            'response': 'WEBID_AUT0GENERATED'
        }
      };
    };
    
    function getUserPayLoad(challengeAnswer, stringify) {
      
      var user = {
        'idProvider': $scope.authProvider,
        'user': {
          'email': $scope.user.email,
          'firstName': $scope.user.firstName,
          'lastName': $scope.user.lastName,
          'password': $scope.user.password,
          'language': $scope.language,
          'country': $scope.country,
          'title': $scope.user.title,
          'postalCode': ''
        },
        'challengeQuestion': {
          'questionId': $scope.challengeQuestion,
          'response': $scope.user.answer || challengeAnswer
        }
      };
      
      if (stringify) {
        user = angular.toJson({ InUser: user });
      }
      return user;
      
    };

    function getChallengeQPayload(owner) {
        owner = owner || $scope;
        return JSON.stringify(
            {
                "InGetChallengeQuestion": {
                    "idProvider":   owner.authProvider,
                    "accountAlias": owner.email,
                    "locale": "en_US"
                }
            });
    }

    function getAuthChallengeQPayload(owner) {
      owner = owner || $scope;
      return JSON.stringify({
        'InAuthFromCQ': {
          'idProvider': owner.authProvider,
          'authOwner': 'HPWS',
          'accountAlias': owner.email,
          'response': [{
            'questionID': owner.challengeQuestionId,
            'response': owner.answer
          }]
        }
      });
    }

});
