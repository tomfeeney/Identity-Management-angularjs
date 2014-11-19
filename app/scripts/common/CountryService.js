'use strict';

angular.module('IdMClientApp').service('CountryService', function () {
    this.getCountries = function () {
        return countries;
    };

    this.getDefaultCountry = function() {
        return countries[0];
    };
    var countries = [

        {
            name: 'United States',
            code: 'US'
        },
        {
            name: 'Poland',
            code: 'PL'
        },
        {
            name: 'United Kingdom',
            code: 'GB'
        },
        {
            name: 'China',
            code: 'CN'
        }
    ];

});
