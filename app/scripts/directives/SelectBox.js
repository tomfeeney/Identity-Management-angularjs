'use strict';

angular.module('IdMClientApp').directive('idmSelectBox', function($parse) {
  
  return {
    
    restrict: 'A',
    priority: 100,
    transclude: true,
    replace: true,
    scope: {
      theModel: '=ngModel',
//      theOptions: '@ngOptions',
      onChange: '&ngChange',
//      emptyLabel: '@idmSelectbox'
    },
    templateUrl: '/scripts/directives/selectbox.html',
    
    link: function (scope, element, attrs) {
      
      var setOption = function() {
        angular.forEach(scope.options, function(opt, key) {
          if (opt.value == scope.theModel) {
            scope.selectedOption = opt;
            scope.theModel = scope.selectedOption;
            return;
          }
        });
      };
      
      scope.$watch('theModel', function (newVal, oldVal) {
        setOption();
        if (angular.isFunction(scope.onChange) && (newVal != oldVal)) {
          scope.onChange();
        }
      });
      
      scope.selectOption = function(option) {
        scope.selectedOption = option;
        scope.theModel = scope.selectedOption.value;
      };

      // parse options
      scope.options = [];
      // add empty option if set
      if (attrs.idmSelectBox) {
        scope.options.push({
          'label': attrs.idmSelectBox,
          'value': ''
        })
      }
      // grab the options from content
      var options = element.find(".idm-selectbox-transclude").children();
      if (angular.isObject(options) && options.length) {
        angular.forEach(options, function(value, key) {
          scope.options.push({ 
            'label': $(value).text(),
            'value': $(value).val() });
        });
      }

//      attrs.$observe('ngOptions', function (value, element) {
//        if (!angular.isDefined(value)) return;
//        var match, loc = {};
//        var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*)|(?:\(\s*([\$\w][\$\w\d]*)\s*,\s*([\$\w][\$\w\d]*)\s*\)))\s+in\s+(.*)$/;
//        if (match = value.match(NG_OPTIONS_REGEXP)) {
//          var displayFn = $parse(match[2] || match[1]),
//              valueName = match[4] || match[6],
//              valueFn = $parse(match[2] ? match[1] : valueName),
//              valuesFn = $parse(match[7]);
//          scope.$watch(function(){ return valuesFn(scope.$parent); }, function(newVal) {
//            var collection = newVal || [];
//            scope.options = [];
//            angular.forEach(collection, function (value, key) {
//              loc[valueName] = collection[key];
//              scope.options.push({
//                'label': displayFn(scope.$parent, loc),
//                'value': valueFn(scope.$parent, loc)
//              });
//            });
//            setOption();
//          });
//        }
//      });
      
    }
  
  };
  
});