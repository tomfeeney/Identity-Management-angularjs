'use strict';

angular.module('IdMClientApp').directive('idmShow', function(UtilService) {
  return { 
    link: function(scope, elem, attrs, ctrl) {
      scope.$watch(attrs.idmShow, function(value) {
        elem.toggleClass('hide-me', !UtilService.toBoolean(value));
      });
    }
  };
})
.directive('idmForm', function($compile) {
  return { 
    link: function(scope, elem, attrs, ctrl) {
      // render asterisk icon
      var asterisk = $('<i class="glyphicon-asterisk idm-asterisk"></i>');
      elem.find('input[required]').closest('.form-group').children('label').prepend(asterisk.clone());
      $('.idm-msg-asterisk').prepend(asterisk);
      // append valid icon
      var formName = elem.attr('name');
      elem.find('input[type="text"], input[type="email"], input[type="password"]').each(function(i, e) {
        var $e = $(e);
        var iconClass = 'success-icon' + ($e.attr('icon-type') || '');
        var validIcon = $('<span class="' + iconClass + '">&nbsp;</span>');
        var modelName = $e.attr('name');
        var ngShow = [ formName, modelName, '$dirty' ].join('.') + ' && ' + [ formName, modelName, '$valid' ].join('.');
        $e.after($compile(validIcon.attr('ng-show', ngShow))(scope));
      });
    }
  };
})
.directive('modalScrollable', function() {
  return { 
    link: function(scope, elem, attrs, ctrl) {
      elem.addClass('idm-modal-scrollable');
      // set the max-height of the modal-body so that it can scroll.
      $(window).resize(function() {
        var adj = elem.attr('modal-scrollable') || 0;
        adj = 180 - adj;
        if ($.browser.mozilla) adj += 90;
        var maxHeight = $(this).height() - adj + 'px';
        elem.css('max-height', maxHeight);
      });
      $(window).resize();
    }
  };
})
.directive('webidSignupForm', function($location) {
  return { 
    link: function(scope, elem, attrs, ctrl) {
      var optname = $location.search().option == 'optname';
      if (!optname) return;
      // Passing in "optname" option causes the registration page to render name fields as optional fields below the confirm password input field. 
      elem.find('#confirmPasswordSection').after(elem.find('#nameSection'));
      elem.find('#nameSection input').each(function(idx, input) {
        var $input = $(input);
        $input.attr('placeholder', $input.attr('placeholder') + ' (optional)');
      });
    }
  };
})
.directive('idmModelFixer', function () {
  return { 
    restrict: 'A', 
    require: 'ngModel',
    scope: { 
      model: '=ngModel'
    },
    link: function(scope, element, attrs, ngModelCtrl) {
      if (scope.model && typeof scope.model == 'number') {
        scope.model = scope.model.toString();
      }
    }
  };
})
.directive('autoFillSync', function ($timeout) {
  return { 
    restrict: 'A', 
    require: 'ngModel',
    link: function(scope, element, attrs, ngModelCtrl) {
      var origVal = element.val();
      $timeout(function() {
        var newVal = element.val();
        if (ngModelCtrl.$pristine && origVal !== newVal) {
          ngModelCtrl.$setViewValue(newVal);
        }
      }, 500);
    }
  };
});
