'use strict';

angular.module('IdMClientApp').service('LanguageService', function () {
    this.getLanguages = function () {
        return languages;
    };
    this.getDefaultLanguage = function() {
        return languages[0];
    };
    var languages = [
        {
            name: 'English',
            code: 'en'
        },
        {
            name: 'French',
            code: 'fr'
        },
        {
            name: 'German',
            code: 'de'
        },
        {
            name: 'Spanish',
            code: 'es'
        },
        {
            name: 'Japanese',
            code: 'ja'
        },
        {
            name: 'Chinese',
            code: 'zh'
        },
        {
            name: 'Hindi',
            code: 'hi'
        }
    ];
});