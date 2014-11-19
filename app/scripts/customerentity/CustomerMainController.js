'use strict';

angular.module('IdMClientApp').controller('CustomerMainController', function($scope) {
  
  $scope.initPage = function() {
    $scope.templatePath = '/views/customerentity/customers.html';
  };
  
  $scope.selectTab = function(tab) {
    $scope.templatePath = '/views/customerentity/' + tab + '.html';
  };

})
.controller('CustomerController', function ($scope, $filter, UtilService, CustomerService) {
  
  $scope.initCustomers = function() {
//    UtilService.showSpinner('Loading customers...');
    CustomerService.getCustomerEntities(function(result) {
      $scope.customers = result.customers;
      reloadCustomers();
    });
  };
  
  var reloadCustomers = function(currentPage) {
    $scope.searchCustomers($scope.customerCriteria);
    $scope.setCustomerPage(currentPage || 1);
    UtilService.hideSpinner();
  };
  
  $scope.searchCustomers = function(customerCriteria) {
    $scope.customerCriteria = customerCriteria;
    $scope.matchCustomers = $filter('filter')($scope.customers, { name: customerCriteria });
    $scope.setCustomerPage(1);
  };
  
  $scope.setCustomerPage = function(pageNo) {
    $scope.currentPage = pageNo;
    $scope.pageCustomers = $scope.setPage(pageNo, $scope.matchCustomers);
  };

  $scope.addCustomer = function() {
    UtilService.showDialog('views/customerentity/customer-dlg.html').then(function(customerEntity) {
      
    });
  };
  
  $scope.updateCustomer = function(customerEntity) {
    customerEntity.title = 'Update Customer Entity';
    UtilService.showDialog('views/customerentity/customer-dlg.html', customerEntity).then(function(customerEntity) {
      
    });
  };
  
  $scope.deleteCustomer = function(product) {
    UtilService.confirm('Do you really want to delete the customer?', 'Delete Customer').then(function yes() {
      
    });
  };

})
.controller('CustomerUsersController', function ($scope, $filter, UtilService, CustomerService) {
  
  $scope.initUsers = function() {
//    UtilService.showSpinner('Loading customers...');
    async.waterfall([
      function(next) {
        // Step 1: load all customers
        CustomerService.getCustomerEntities(function(result) {
          $scope.customers = result.customers;
          $scope.selectedCustomer = $scope.customers[0];
          next();
        });
      },
      function(next) {
        // Step 2: list roles based on selected customer
        CustomerService.getCustomerRoles($scope.selectedCustomer, function(result) {
          $scope.roles = result;
          next();
        });
      },
      function() {
        $scope.loadUsers();
      }
    ], function (err, result) {
      
    });
  };
  
  $scope.loadUsers = function() {
//    UtilService.showSpinner('Loading customer users...');
    CustomerService.getCustomerUsers($scope.selectedCustomer, $scope.selectedRole, function(result) {
      $scope.users = result;
      reloadUsers();
      $scope.$$phase || $scope.$apply(); // safe apply
    });
  };
  
  var reloadUsers = function(currentPage) {
    $scope.searchUsers($scope.userCriteria);
    $scope.setUserPage(currentPage || 1);
    UtilService.hideSpinner();
  };
  
  $scope.searchUsers = function(userCriteria) {
    $scope.userCriteria = userCriteria;
    $scope.matchUsers = $filter('filter')($scope.users, { email: userCriteria });
    $scope.setUserPage(1);
  };
  
  $scope.setUserPage = function(pageNo) {
    $scope.currentPage = pageNo;
    $scope.pageUsers = $scope.setPage(pageNo, $scope.matchUsers);
  };
  
  $scope.inviteUser = function() {
    var data = {
      customer: $scope.selectedCustomer,
      roles: $scope.roles
    };
    UtilService.showDialog('views/customerentity/invite-user-dlg.html', data).then(function(customerEntity) {
      
    });
  };
  
});