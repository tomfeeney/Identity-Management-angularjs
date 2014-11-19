'use strict';

angular.module('IdMClientApp').directive('idmPager', function() {
  
  /*
   * <idm-pager on-select-page="setProductPage(page)" match-items="matchProducts" />
   *  to
   * <pagination on-select-page="setProductRolePage(page)" ng-show="matchProductRoles && matchProductRoles.length != 0" total-items="matchProductRoles.length" page="currentPage" items-per-page="itemsPerPage" class="pagination pull-right" max-size="5" rotate="false"></pagination>
   */
  
  return {
    restrict: 'E',
    compile: function(elem, attrs) {
      var $elem = $(elem);
      var $pager = $('<pagination page="currentPage" items-per-page="itemsPerPage" class="pagination pull-right" max-size="5" rotate="false"></pagination>');
      $pager.attr('on-select-page', $elem.attr('on-select-page'));
      var matchItems = $elem.attr('match-items');
      $pager.attr('ng-show', matchItems + ' && ' + matchItems + '.length != 0');
      $pager.attr('total-items', matchItems + '.length');
      $elem.append($pager);
    }
  };
  
})
.directive('idmSearchBox', function() {
  
  /*
   * <idm-search-box criteria="productRoleCriteria" placeholder="Search by role name" on-search="searchProductRoles(productRoleCriteria)" search-disabled="isEmpty(selectedProduct)" />
   *  to
   * <div class="input-group">
   *   <input type="text" class="form-control" ng-model="productCriteria" placeholder="Search by product name" ui-keyup="{ 'enter': 'searchProducts(productCriteria)' }" />
   *   <span class="input-group-btn">
   *     <button class="btn btn-default" type="button" ng-click="searchProducts(productCriteria)"><span class="glyphicon glyphicon-search"></span></button>
   *   </span>
   * </div>
   */
  
  return {
    restrict: 'E',
    compile: function(elem, attrs) {
      var $elem = $(elem);
      var $searchBox = $('<div class="input-group"></div>');
      var criteria = $elem.attr('criteria');
      var placeholder = $elem.attr('placeholder');
      var onSearch = $elem.attr('on-search');
      var disabled = $elem.attr('search-disabled');
      var $text = $('<input type="text" class="form-control" ng-model="' + criteria + '" placeholder="' + placeholder + '" ui-keyup="{ \'enter\': \'' + onSearch + '\' }" />');
      if (disabled) $text.attr('ng-disabled', disabled);
      $searchBox.append($text);
      var $button = $('<span class="input-group-btn"><button class="btn btn-default" type="button" ng-click="' + onSearch + '"><span class="glyphicon glyphicon-search"></span></button></span>');
      if (disabled) $button.attr('ng-disabled', disabled);
      $searchBox.append($button);
      $elem.append($searchBox);
    }
  };
  
})
.directive('idmMultiCheck', function() {
  

  /*
   * <idm-multi-check repeat-model="assignedServices" check-model="data.toBeRemovedServices" criteria="assignedCriteria" search-hint="Search by service name" on-select-all="selectAll($event, 'toBeRemovedServices', 'assignedServices')"></idm-multi-check>
   *  to
   * <div class="input-group sm-margin-v idm-firefox-width-fixer">
   *   <span class="input-group-addon"><input type="checkbox" class="idm-multi-check-all" ng-click="selectAll($event, 'toBeRemovedServices', 'assignedServices')" /></span>
   *   <input type="text" ng-model='assignedCriteria' class='form-control' placeholder='Search by service name' />
   * </div>
   * <div class='form-control idm-multi-check'>
   *   <span ng-repeat="s in assignedServices | filter:stringPredicator(assignedCriteria, 'name') | orderBy:'name'">
   *   <input type='checkbox' id='{{s.id}}' checklist-model='data.toBeRemovedServices' checklist-value='s' /><label for='{{s.id}}' class='idm-unselectable'>{{s.name}}</label>
   *  </span>
   * </div>
   */
  

  return {
    restrict: 'E',
    checkAll: function() {
      var $scope = angular.element(this).scope();
      var self = this;
      var selModel = $(this).attr('selectedModel').split('.')[1];
      var availModel = $(this).attr('availableModel');
      $scope.$apply(function() {
        var $parent = $(self).parents('.input-group').next();
        var allCheckBoxes = [];
        $parent.find("input:checkbox").each(function() {
          if (self.checked) {
            allCheckBoxes.push(angular.element(this).scope().$parent.item);
          } else {
            $scope.data[selModel].length = 0;
          }
        });
        $scope.data[selModel] = allCheckBoxes;
      });
    },
    clearCheckAll: function() {
      $(this).parents('.modal-dialog').find(".idm-multi-check-all").prop("checked", false);
    },
    compile: function(elem, attrs, transclude) {
      var $elem = $(elem);
      var $container = $('<div class="form-control idm-multi-check"></div>');
      var criteria = $elem.attr('criteria');
      var searchHint = $elem.attr('search-hint');
      var repeatModel = $elem.attr('repeat-model');
      var checklistModel = $elem.attr('check-model');
      var modelId = $elem.attr('model-id') || 'id';
      var modelName = $elem.attr('model-name') || 'name';
      var searchByFn = $elem.attr('search-by-fn');
      var searchBy = searchByFn || "'" + modelName + "'";
      var orderByFn = $elem.attr('order-by-fn');
      var orderBy = orderByFn || "'" + modelName + "'";
      var displayText = $elem.text() || 'item.' + modelName;
      var disableSearch = ($elem.attr('disable-search') == 'true');
      var disableOrder= ($elem.attr('disable-order') == 'true');
//      var onSelectAll = $elem.attr('on-select-all') || "selectAll($event, 'a', 'b')";
      orderBy = disableOrder ? '' : ' | orderBy: ' + orderBy;
      var $repeat = $('<span ng-repeat="item in ' + repeatModel + ' | filter:stringPredicator(' + criteria + ', ' + searchBy + ') ' + orderBy + '"></span>');
      $container.append($repeat);
      var $check = $('<input type="checkbox" id="{{item.' + modelId + '}}" checklist-model="' + checklistModel + '" checklist-value="item" /><label for="{{item.' + modelId + '}}" class="idm-unselectable">{{' + displayText + '}}</label>');
      $repeat.append($check);
      $elem.append($container);
      if (!disableSearch) {
        var $searchContainer = $('<div class="input-group sm-margin-v"></div>');
        var $checkAll = $('<input type="checkbox" class="idm-multi-check-all" />');
        $checkAll.attr('selectedModel', checklistModel);
        $checkAll.attr('availableModel', repeatModel);
        $searchContainer.append($('<span class="input-group-addon"></span>').append($checkAll));
        $searchContainer.append('<input type="text" ng-model="' + criteria +'" class="form-control idm-firefox-width-fixer" placeholder="' + searchHint + '"></input>');
        $container.before($searchContainer);
        $(document).on('click', '.idm-multi-check-all', this.checkAll);
        $(document).on('click', '.idm-multi-check-all-clear', this.clearCheckAll);
        $(document).on('change', '.idm-multi-check-all-clear', this.clearCheckAll);
      }
    }
  };
  
});