'use strict';

angular.module('IdMClientApp').directive('match', function ($parse) {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            scope.$watch(function () {
                return $parse(attrs.match)(scope) === ctrl.$modelValue;
            }, function (currentValue) {
                ctrl.$setValidity('mismatch', currentValue);
            });
        }
    };
})
.directive('idmValidator', function() {
  
  var validators = {
    email: {
      validity: 'idmEmail',
      valid: function(email) {
        if (_.isEmpty(email)) return true;
        var emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return emailPattern.test(email);
      }
    },
    name: {
      validity: 'idmName',
      valid: function(name) {
        if (_.isEmpty(name)) return true;
        var nameAntiPattern = /[\\#,`?>\]<\/:;}"[|{~=!@\$%\^&\*\(\)\+_%0-9.-]/i;
        return !nameAntiPattern.test(name);
      }
    }
  };
  
  return {
    restrict: 'A',
    require: 'ngModel',
    
    // scope = the parent scope
    // elem = the element the directive is on
    // attr = a dictionary of attributes on the element
    // ctrl = the controller for ngModel.
    link: function(scope, elem, attr, ctrl) {
        
      // get the regex flags from the regex-validate-flags="" attribute (optional)
      var validator = validators[attr.idmValidator || 'email'];
      
      // add a parser that will process each time the value is 
      // parsed into the model when the user updates it.
      ctrl.$parsers.unshift(function(value) {
        // test and set the validity after update.
        var valid = validator.valid(value);
        ctrl.$setValidity(validator.validity, valid);
        // if it's valid, return the value to the model, 
        // otherwise return undefined.
        return valid ? value : undefined;
      });
      
      // add a formatter that will process each time the value 
      // is updated on the DOM element.
      ctrl.$formatters.unshift(function(value) {
        // validate.
        var valid = validator.valid(value);
        ctrl.$setValidity(validator.validity, valid);
        // return the value or nothing will be written to the DOM.
        return value;
      });
      
    }
  };
});