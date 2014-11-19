'use strict';

angular.module('IdMClientApp').controller('UserEditController', function ($scope, $location, UtilService, UserService, ChallengeQuestionService, CountryService, LanguageService, webStorage) {

    $scope.initProfile = function() {
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

    $scope.updateUser = function () {
      UserService.updateUser(getUpdatePayload(), $scope.editUser, notify, onSuccess);
    };
    
    $scope.changeTitle = function() {
      UtilService.showDialog('views/change-title-dlg.html', $scope.user).then(function(updatedUser) {
        $scope.editUser = updatedUser;
        $scope.updateUser();
      });
    };
    
    $scope.changeName = function() {
      UtilService.showDialog('views/change-name-dlg.html', $scope.user).then(function(updatedUser) {
        $scope.editUser = updatedUser;
        $scope.updateUser();
      });
    };

    $scope.changeEmailAddress = function () {
      UtilService.showDialog('views/change-email-dlg.html', $scope.user).then(function(updatedUser) {
        var user = $scope.user;
        $scope.editUser = updatedUser;
        if (user.email === updatedUser.email) {
          UtilService.error('Email address is already in use, please use another email address to continue', 'Email Address Change');
        } else {
          UserService.changeEmailAddress(webStorage.get('authToken'), updatedUser, notify, onSuccess);
        }
      });
    };

    $scope.changePassword = function () {
      UtilService.showDialog('views/change-password-dlg.html', $scope.user).then(function(updatedUser) {
        UtilService.showSpinner('Changing password...');
        UserService.changeAccountPassword(webStorage.get('authToken'), $scope.user.email, $scope.authProvider, updatedUser.passwordNew, updatedUser.password, function() {
          notify('Your password was successfully changed.', false, 'Password Change');
          UserService.logout();
        }, function(err) {
          notify(err.errorDescription, true, err.title);
        });
      });
    };
    
    $scope.resendVerificationEmail = function() {
      UserService.resendVerificationEmail(function() {
        UtilService.notify('A verification email was sent to ' + $scope.user.email + '.', 'Email Sent');
      });
    };
    
    $scope.changeCountry = function() {
      var data = {
        user: $scope.user,
        countries: $scope.countries
      };
      UtilService.showDialog('views/change-country-dlg.html', data).then(function(data) {
        $scope.editUser = data.user;
        $scope.updateUser();
      });
    };
    
    $scope.changeLanguage = function() {
      var data = {
        user: $scope.user,
        languages: $scope.languages
      };
      UtilService.showDialog('views/change-language-dlg.html', data).then(function(data) {
        $scope.editUser = data.user;
        $scope.updateUser();
      });
    };

    $scope.changeChallengeQ = function () {
      var data = {
        user: $scope.user,
        challengeQuestions: $scope.challengeQuestions
      };
      UtilService.showDialog('views/change-question-dlg.html', data).then(function(data) {
        $scope.editUser = data.user;
        ChallengeQuestionService.changeChallengeQ(changeChallengeQPayload(), notify, onSuccess);
      });
    };

    function onSuccess() {
      // Email can be changed upon user's confirmation.
      var oldEmail = $scope.user.email;
      angular.copy($scope.editUser, $scope.user);
      $scope.user.email= oldEmail;
      // just id updated, now update challengeQuestion. 
      $scope.user.challengeQuestion = ChallengeQuestionService.getChallengeQuestionById($scope.editUser.challengeQuestion.id);
      $scope.user.answer = "";
      $scope.user.password = "";
      $scope.user.passwordNew = "";
      $scope.user.passwordNewConfirm = "";
    }

    function onError() {
      $location.path('/login');
    }

    function notify(message, isError, title) {
      if (isError) {
        console.log('Error ' + message);
        UtilService.error(message, title);
        return;
      }
      UtilService.notify(message, title);
    }

    function getUpdatePayload() {
      return JSON.stringify({
        'InUpdateUser': {
          'authToken': webStorage.get('authToken'),
          'user': {
            'email': $scope.editUser.email,
            'firstName': $scope.editUser.firstName,
            'lastName': $scope.editUser.lastName,
            'language': $scope.editUser.language,
            'country': $scope.editUser.country,
            'title': $scope.editUser.title
          }
        }
      });
    }

    function changeChallengeQPayload() {
      return JSON.stringify({
        "InUpdateAccountCQ": {
          "idProvider":  webStorage.get('idProvider'),
          "token": webStorage.get('authToken'),
          "emailaddress": $scope.editUser.email,
          "newResponse": {
            "questionID": $scope.editUser.challengeQuestion.id,
            "response": $scope.editUser.answer
          }
        }
      });
    }

    function getChallengeQPayload() {
      return JSON.stringify({
        "InGetChallengeQuestion": {
          "idProvider":  webStorage.get('idProvider'),
          "accountAlias": $scope.email,
          "locale": "en_US"
        }
      });
    }
});
