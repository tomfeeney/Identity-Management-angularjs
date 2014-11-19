'use strict';

angular.module('IdMClientApp').directive('idmWizard', function() {
  
  return {
    
    restrict: 'E',
    transclude: true,
    templateUrl: 'idm-wizard.html',
    replace: true,
    
    scope: {
      name: '=',
      formName: '=',
      currentStepIndex: '=',
      onBeforeStepChange: '&',
      onStepChanging: '&',
      onAfterStepChange: '&'
    },
    
    link: function(scope, elem, attrs, ctrl) {
      scope.name = ctrl;
      scope.formName = scope[attrs['formName']];
      scope.currentStepIndex = 0;
      scope.steps[scope.currentStepIndex].currentStep = true;
    },
    
    controller: function($scope) {
      
      $scope.steps = [];
      
      this.registerStep = function(step) {
        $scope.steps.push(step);
      };
      
      var toggleSteps = function(showIndex) {
        
        var event = { event: { fromStep: $scope.currentStepIndex, toStep: showIndex } };
        
        if ($scope.onBeforeStepChange) {
          if ($scope.onBeforeStepChange(event) === false) return;
        }
        
        $scope.steps[$scope.currentStepIndex].currentStep = false;
        
        if ($scope.onStepChanging) {
          $scope.onStepChanging(event);
        }
        
        $scope.currentStepIndex = showIndex;
        $scope.steps[$scope.currentStepIndex].currentStep = true;
        
        if ($scope.onAfterStepChange) {
          $scope.onAfterStepChange(event);
        }
        
      };
      
      this.showNextStep = $scope.showNextStep = function() {
        toggleSteps($scope.currentStepIndex + 1);
      };
      
      this.showPreviousStep = $scope.showPreviousStep = function() {
        toggleSteps($scope.currentStepIndex - 1);
      };
      
      this.hasNext = $scope.hasNext = function() {
        return $scope.currentStepIndex < ($scope.steps.length - 1);
      };
      
      this.hasPrevious = $scope.hasPrevious = function() {
        return $scope.currentStepIndex > 0;
      };
      
    }
    
  };
  
})
.directive('idmStep', function() {
  
  return {
    
    require: '^idmWizard',
    restrict: 'E',
    transclude: true,
    template: '<div class="idm-step" ng-show="currentStep"><div class="idm-step-title">{{stepTitle}}</div><div ng-transclude></div></div>',
    replace: true,
    
    scope: {
      stepTitle: '@'
    },
    
    link: function(scope, elem, attrs, wizardCtrl) {
      wizardCtrl.registerStep(scope);
    }
    
  };
  
});