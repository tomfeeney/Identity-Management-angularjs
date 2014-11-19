'use strict';

angular.module('IdMClientApp').service('DeviceService', function ($http, webStorage, ConfigService, UtilService) {
  
  this.getDeviceTypes = function() {
    return {
      A: 'Android',
      B: 'Browser',
      C: 'Castle',
      I: 'IOS',
      P: 'Pixie',
      U: 'Ubuntu',
      W: 'Windows'
    };
  }
  
});