'use strict';

angular.module('IdMClientApp').controller('ProfileController', function ($scope, $location, ConfigService, CountryService, LanguageService, UserService, WebIdService, UtilService) {
  
  var token = $location.search().token;
  var email = $location.search().email;
  var userOrig = {};

  $scope.initProfile = function() {
    $scope.countries = CountryService.getCountries();
    $scope.languages = LanguageService.getLanguages();
    UserService.userAggregate(token, email, function(accountInfo) {
      $scope.user = accountInfo.accountInfo;
      $scope.user.firstName = $scope.user.firstName || '';
      $scope.user.lastName = $scope.user.lastName || '';
      $scope.user.emailConfirm = $scope.user.email;
      $scope.user.password = "******";
      $scope.user.passwordNew = "******";
      $scope.user.passwordConfirm = "******";
      angular.copy($scope.user, userOrig);
      ConfigService.resetNoScram(accountInfo.accountInfo.idProvider);
    });
  };
  
  $scope.editEnabled = function() {
//    return !($scope.changingEmail || $scope.changingPassword);
    return !($scope.changingPassword);
  };
  
  
  $scope.updateUser = function(callback) {
    
    if ($scope.changingPassword) {
      changePassword();
      return;
    }
    
    var self = this;
    async.waterfall([
      function(next) {
        if ($scope.appForm.email.$dirty) {
//        if ($scope.changingEmail) {
          changeEmail(function() {
            next();
          });
          return;
        }
        next();
      }, function(next) {
        if ($scope.editEnabled()) {
          var userCopy = angular.copy($scope.user);
          userCopy.email = email;
          UserService.updateWebIdUser(token, userCopy, function() {
            WebIdService.resultRedirect();
            next(null, 'done');
          });
        }
      }
    ], function(err, result) {
      if (callback) callback(err, result);
    });

  };
  
  $scope.onChangingPassword = function() {
    angular.copy(userOrig, $scope.user);
    $scope.appForm.$setPristine();
    $scope.user.password = $scope.user.passwordNew = $scope.user.passwordConfirm = "";
  };
  
  $scope.onCancelChangingPassword = function() {
    $scope.user.password = $scope.user.passwordNew = $scope.user.passwordConfirm = "******";
  };
  
  $scope.cancelUpdate = function() {
    WebIdService.cancelRedirect();
  };
  
  var changePassword = function () {
    UserService.changeAccountPassword(token, $scope.user.email, $scope.user.idProvider, $scope.user.passwordNew, $scope.user.password, function() {
      $scope.changingPassword = false;
      WebIdService.resultRedirect();
//      UtilService.lnotify('Your password was successfully changed.', null, 'Password Change');
    }, function(err) {
      UtilService.lnotify(err.errorDescription, true, err.title);
    });
  };
  
  var changeEmail = function(onSuccess) {
    if ($scope.user.email == email) {
//      UtilService.lnotify('Email address is already in use', true);
      return;
    }
    UserService.changeEmailAddress(token, $scope.user, notify, onSuccess);
  };
  
  var notify = function(message, isError, title) {
    UtilService.lnotify(message, isError, title);
  };

}).controller('PortalProfileController', function ($scope, $location, webStorage, ConfigService, CountryService, LanguageService, ChallengeQuestionService, UserService, WebIdService, UtilService) {
  
  var token = $location.search().token;
  var email = $location.search().email;
  var redirectUri = $location.search().redirect_uri;
  var state = $location.search().state;
  var changedPassword = false;

  $scope.initProfile = function() {
    $scope.countries = CountryService.getCountries();
    $scope.languages = LanguageService.getLanguages();
    UtilService.showSpinner('Loading User Profile...');
    if (UtilService.hasUrlParam($location.search(), 'admin', 'true')) {

      var accountId = $location.search().accountId;
      if (accountId == "") {
        UtilService.lnotify("Account id cannot be empty.", true, "Change Profile");
        return;
      }

      UserService.getUserInfo(token, function(adminInfo) {
        UserService.getUserInfoById(accountId, function(accountInfo) {
          if (accountInfo.accountInfo.idProvider.toLowerCase() != adminInfo.idProvider.toLowerCase() ) {
            UtilService.lnotify("Token and account id does not belong to the same idprovider.", true, "Change Profile");
            return;
          }
          $scope.user = accountInfo.accountInfo;

          //fill the hided select.
          $scope.user.challengeQuestion = {id:1001,question:""};

          webStorage.add('user', $scope.user);
          ConfigService.resetNoScram(accountInfo.accountInfo.idProvider);
          UtilService.hideSpinner();
        });
      }, function(){});
    } else {
      UserService.userAggregate(token, email, function(accountInfo) {
        $scope.user = accountInfo.accountInfo;
        $scope.challengeQuestions = accountInfo.challengeQuestions;
        if (accountInfo.acctChallengeQuestions) {
          $scope.user.challengeQuestion = accountInfo.acctChallengeQuestions;
        } else {
          $scope.user.challengeQuestion = accountInfo.challengeQuestions[0];
        }
        webStorage.add('user', $scope.user);
        ConfigService.resetNoScram(accountInfo.accountInfo.idProvider);
        UtilService.hideSpinner();
      });
    }
  };
  
  $scope.editEnabled = function(field) {
    var changingPassword = UtilService.hasUrlParam($location.search(), 'changepassword');
    var isAdmin = UtilService.hasUrlParam($location.search(), 'admin');
    if (field == 'secq') {
      return !isAdmin;
    }
    if (field == 'crtp') {
      return !changingPassword && !isAdmin;
    }
    return !changingPassword;
  };

  $scope.cancelUpdate = function() {
    redirectUri = redirectUri + '?error=user_cancelled';
    WebIdService.oAuthTokenRedirect(redirectUri);
  };

  $scope.updateUser = function() {

    if ($scope.user.currentPassword && $scope.user.passwordNew) {
      UtilService.confirm('You\'re going to change your password, re-login is required, are you sure?', 'Change Profile').then(function () {
        changeProfile();
      }, function () {
        return;
      });
    } else {
      changeProfile();
    }

  };

  var changeProfile = function () {
    var provider = $scope.user.idProvider;
    async.waterfall([
      function(next) {
        // save user profile
        if ($scope.editEnabled()) {
          var userCopy = angular.copy($scope.user);
          userCopy.email = email;
          changeUserProfile(token, userCopy, function() {
            next();
          });
        } else {
          next();
        }
      }, function(next) {
        // change challenge question
        if ($scope.editEnabled('secq') && $scope.user.answer) {
          changeChallangeQA(changeChallengeQPayload(), function (message, isError, title) {
            //pass by notify.
          }, function () {
            next();
          });
        } else {
          next();
        }
      }, function(next) {
        // reset password
        if (!$scope.editEnabled()) {
          resetPassword(token, $scope.user, $scope.user.passwordNew, function () {
            next();
          }, function (err) {
            UtilService.lnotify(err, true, "Reset Password");
          });
        } else if ($scope.editEnabled('crtp') && $scope.user.currentPassword && $scope.user.passwordNew) {
          //change password
          changePassword(token, $scope.user.email, $scope.user.idProvider, $scope.user.passwordNew, $scope.user.currentPassword, function() {
            changedPassword = true;
            next();
          }, function(err) {
            UtilService.lnotify(err.errorDescription, true, err.title);
          });
        } else {
          next();
        }
      }, function(next) {
        // login and get a token
        if (!$scope.editEnabled()) {
          UserService.loginScram(email, $scope.user.passwordNew, provider, function () {
            next();
          }, function (e) {
            notify(e.errorDescription, true, e.title);
          });
        } else {
          UtilService.hideSpinner();
          next();
        }
      }, function(next) {
        // redirect user back to portal
        if (!$scope.editEnabled()) {
          redirectUri = redirectUri + '?code=' + webStorage.get('authToken');
          if (state) {
            redirectUri = redirectUri + '&state=' + state;
          }
        } else {
          if (changedPassword) {
            redirectUri = redirectUri + '?changedpassword=true';
          }
        }
        WebIdService.oAuthTokenRedirect(redirectUri);
      }], function(err, result) {

    });
  }

  var changeUserProfile = function (token, userCopy, success) {
    UtilService.showSpinner('Updating User Profile...');
    UserService.updateWebIdUser(token, userCopy, success);
  };

  var changeChallangeQA = function (payload, error, success) {
    UtilService.showSpinner('Updating User Challenge Question...');
    ChallengeQuestionService.changeChallengeQ(payload, error, success);
  };

  var changePassword = function (token, email, idProvider, passwordNed, password, success, error) {
    UtilService.showSpinner('Changing Password...');
    UserService.changeAccountPassword(token, email, idProvider, passwordNed, password, success, error);
  };

  var resetPassword = function (token, user, passwordNew, success, error) {
    UtilService.showSpinner('Resetting Password...');
    UserService.changeWebIdPassword(token, user, passwordNew, success, error);
  };

  function changeChallengeQPayload() {
    return JSON.stringify({
      "InUpdateAccountCQ": {
        "idProvider":  $scope.user.idProvider,
        "token": token,
        "emailaddress": email,
        "newResponse": {
          "questionID": $scope.user.challengeQuestion.id,
          "response": $scope.user.answer
        }
      }
    });
  }
});