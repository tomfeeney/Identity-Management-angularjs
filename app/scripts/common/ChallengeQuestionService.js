'use strict';

angular.module('IdMClientApp').service('ChallengeQuestionService', function (ConfigService, webStorage, $http) {

    var challengeQuestions = [];

    this.getChallengeQuestionById = function (id) {
        return _.where(challengeQuestions, { id: id })[0];
    };

    this.getChallengeQuestions = function (onSuccess) {

        return $http({
            method: 'GET',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/getAllChallengeQuestions?locale=en_us',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache'}
        }).success(function (data, status, headers, config) {
                challengeQuestions = data.OutChallengeQuestions.challengeQuestions;
                onSuccess(challengeQuestions);
            });

    };

    this.getChallengeQ = function (payload, notify, onSuccess) {

        $http({
            method: 'POST',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/getAccountChallengeQuestions',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache'},
            data: payload
        }).success(function (data, status, headers, config) {
                if (status === 200) {
                    onSuccess(data.OutChallengeQuestions.challengeQuestions);
                } else if ((status === 400) || (status === 500) || data.error !== null) {
                    notify(data.error_cause, false);
                } else if (status === 200 && data.JSONException) {
                    notify(data.JSONException.message, false);
                }
            });
    };

    this.changeChallengeQ = function (payload, notify, onSuccess) {

        var self = this;

        $http({
            method: 'POST',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/changeChallengeQuestion',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache'},
            data: payload
        }).success(function (data, status, headers, config) {
                if (status === 200 && !data.JSONException) {
                    var user = webStorage.get('user');
                    user.challengeQuestion = user.challengeQuestion || {}; // CS-12703: account can be created without challenge question using API.
                    angular.copy(self.getChallengeQuestionById(JSON.parse(payload).InUpdateAccountCQ.newResponse.questionID), user.challengeQuestion);
                    webStorage.add('user', user);
                    notify('Your security question was successfully changed.', false, 'Security Question Change');
                    onSuccess();
                } else if ((status === 400) || (status === 500) || data.error !== null) {
                    notify(data.error_cause, false);
                } else if (status === 200 && data.JSONException) {
                    notify(data.JSONException.message, false);
                }
            });
    };

    this.authenticateChallengeQ = function (payload, notify, onSuccess) {

        return $http({
            method: 'POST',
            url: ConfigService.getEndpoint() + '/identitymanagement/services/authenticateFromChallengeQuestion',
            headers: {'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache'},
            data: payload
        }).success(function (data, status, headers, config) {
                if (status === 200 && data.AuthenticateInfo) {
                    onSuccess(data.AuthenticateInfo);
                } else if ((status === 400) || (status === 500) || data.error !== null) {
                    notify(data.error_cause, false);
                } else if (status === 200 && data.JSONException) {
                    notify(data.JSONException.message, false);
                }
            });
    };
});
