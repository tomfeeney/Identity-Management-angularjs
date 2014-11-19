'use strict';

app.constant('IdMConfig', {
  'eula': {
    'gcc_vertica_browser': 'vertica',
    'gcc_vertica_android': 'vertica',
    'gcc_vertica_ios': 'vertica',
    'gcc_cloudos_browser': 'cloudos',
    'gcc_cloudos_android': 'cloudos',
    'gcc_cloudos_ios': 'cloudos',
    'hpws_cloudos_multi': 'cloudos'
  },
  'SCRAM_WHITE_LIST': [
    'cloudos',
    'moonshot'
  ]
});

app.service('ConfigService', function (IdMConfig) {

    var IdentityWebServiceConfig = {
      // endpoint should be empty, when the service is started with idmclientwebapp & nodejs and it uses config.json
      // endpoint should be set with IDM Web service url, when the service is started with grunt
      endpoint : ""
      //endpoint : "http://148.92.244.137:10140"
    };

    this.getEndpoint = function () {
      return IdentityWebServiceConfig.endpoint;
    };
    
    var noScramVal;
    
    // force recheck the noscram white list.
    this.resetNoScram = function(provider, bypassScram) {
      noScramVal = undefined;
      return this.noScram(provider, bypassScram);
    };
    
    this.noScram = function(provider, bypassScram) {
      if (angular.isDefined(noScramVal)) return noScramVal;  // if already calculated the noScram, then just return;
      provider = (provider || '').toLowerCase();
      noScramVal = _.contains(IdMConfig.SCRAM_WHITE_LIST, provider);  // calculate noScram
      if (noScramVal) return noScramVal; // if whitelisted, then no scram
      if (bypassScram) {
        noScramVal = true;
        return noScramVal; // if bypass scram by setting the noScram in url querystring, then bypass
        // this is resetting the noScramVal, so after reseting password, there should be no further operations.
      }
      return noScramVal;
    }
    
});

