'use strict';

angular.module('IdMClientApp').controller('GroupController', function ($scope, $http, $location, $filter, $route, UtilService, EnterpriseService, GroupService, webStorage) {
    
    $scope.initAddGroup = function () {
        $scope.groupNew = {
            membership: 'automatic',
            visibility: 'public',
            scope: 'enterprise'
        };
        $scope.isSubGroup = false;
    };

    $scope.initGroups = function () {

      UtilService.showSpinner('Loading groups...');
      $scope.groups = [];
      $scope.memberships = GroupService.getMemberships();
      $scope.scopes = GroupService.getScopes();
      $scope.visibilities = GroupService.getVisibilities();
      GroupService.getGroups(function(entGroups) {
        $scope.groups = entGroups;
        reloadGroups();
      });
    };
    
    var reloadGroups = function(currentPage) {
      $scope.groups = $filter('orderBy')($scope.groups, UtilService.stringGetter('name'));
      $scope.searchGroups($scope.groupCriteria);
      $scope.setGroupPage(currentPage || 1);
      UtilService.hideSpinner();
    };


    function notify(message, isError) {
//      if (isError) {
//        console.log('Error ' + message);
//      }
      UtilService.lnotify(message, isError);
    }

    $scope.getGroups = function () {
        GroupService.getGroups(onSuccessGetGroups);
    };

    function onSuccessGetGroups(entGroups) {
        $scope.groups = entGroups;
        $scope.matchGroups = entGroups;
        $scope.currentPage = 1;
        $scope.setGroupPage($scope.currentPage);
        UtilService.hideSpinner();
    }

    $scope.searchGroups = function(groupCriteria) {
      $scope.groupCriteria = groupCriteria;
      $scope.matchGroups = $filter('filter')($scope.groups, UtilService.stringComparator(groupCriteria, 'name'));
      $scope.setGroupPage(1);
    };
  
    $scope.setGroupPage = function (pageNo) {
      $scope.currentPage = pageNo;
      $scope.pageGroups = $scope.setPage(pageNo, $scope.matchGroups);
    };
    
    $scope.addGroupDlg = function() {
      var data = { 
        memberships: $scope.memberships,
        scopes: $scope.scopes, 
        visibilities: $scope.visibilities,
        group: {
          membership: 'automatic', 
          visibility: 'public',
          scope: 'enterprise'
        }
      };
      UtilService.showDialog('views/groups/group-dlg.html', data).then(function(data) {
        UtilService.showSpinner('Adding group...');
        GroupService.addGroup(data.group, function(newGroup) {
          $scope.groups.push(newGroup);
          reloadGroups($scope.currentPage);
        }, function(message, isError) {
          notify(message, isError);
        });
      });
    };
    
    $scope.updateGroupDlg = function(group) {
      var data = {
        mode: 'edit',
        title: 'Edit Group Details',
        memberships: $scope.memberships,
        scopes: $scope.scopes, 
        visibilities: $scope.visibilities,
        group: group
      };
      UtilService.showDialog('views/groups/group-dlg.html', data).then(function(data) {
        UtilService.showSpinner('Updating group...');
        GroupService.updateGroup(data.group, notify, function(updatedGroup) {
            notify('Group successfully updated.');
            angular.copy(updatedGroup, group);
            reloadGroups($scope.currentPage);
        });
      });
    };

    $scope.addGroup = function () {
      if ($scope.isSubGroup) {
        GroupService.addSubGroup($scope.groupNew, function(ownerId) {
          UtilService.notify('SubGroup successfully added.');
        }, notify);
      } else {
        GroupService.addGroup($scope.groupNew, notify, true);
      }
    };

    $scope.removeGroup = function (group) {
        $scope.selectGroup(group);
        UtilService.confirm('Do you really want to delete the group?', 'Delete Group').then(function yes() {
          UtilService.showSpinner('deleting group...');
          GroupService.removeGroup($scope.selectedGroup, function(group) {
            UtilService.notify('Group successfully deleted.');
            $scope.groups = _.without($scope.groups, _.findWhere($scope.groups, { id: group.id }));
            reloadGroups($scope.currentPage);
          }, function(message, isError) {
            notify(message, isError);
          });
        });
    };

    $scope.updateGroup = function () {
        GroupService.updateGroup($scope.copyGroup, notify, function(group) {
          notify('Group successfully updated.');
        });
    };

    $scope.selectGroup = function(group) {
        $scope.selectedGroup = group;
        $scope.copyGroup = angular.copy(group);
    };

    $scope.assignUsers = function(group) {
      $scope.selectedGroup = group;
      UtilService.showDialog('views/groups/group-users-dlg.html', group, 'GroupAssignUserController').then(function(result) {
        UtilService.notify("Add/Remove user(s) operation successfully completed.");
      });
    };


  $scope.assignSubGroups = function(group) {
    $scope.selectedGroup = group;
    UtilService.showDialog('views/groups/group-subgroups-dlg.html', group, 'GroupAssignSubGroupController').then(function(result) {
      UtilService.notify("Add/Remove group(s) operation successfully completed.");
    });
  };

  $scope.assignProductRoles = function(group) {
    $scope.selectedGroup = group;
    UtilService.showDialog('views/groups/group-productRoles-dlg.html', group, 'GroupAssignProductRoleController').then(function(result) {
      UtilService.notify("Add/Remove role(s) operation successfully completed.");
    });
  };
  
})
.controller('GroupAssignUserController', function ($scope, $modalInstance, data, UtilService, EnterpriseService, GroupService) {

  $scope.data = data || {};
  var group = $scope.data;
  $scope.usersPerPage = 100;
  
  $scope.cancel = function() {
    $modalInstance.dismiss('canceled');
  };

  $scope.save = function() {
    UtilService.showSpinner('Maintaining Users...');
    var groupUserEmailsChosen = _.pluck($scope.groupUsers, 'userEmail');
    var addUsers = _.difference(groupUserEmailsChosen, $scope.groupUserEmails);
    var deleteUsers = _.difference($scope.groupUserEmails, groupUserEmailsChosen);
    GroupService.saveGroupUsers(group, addUsers, deleteUsers, function() {
      $modalInstance.close();
    }, function(result) {
      if (result) {
        var errors = _.pluck(result, 'errorMessage');
        var newErrors = [];
        _.each(errors, function (item) {newErrors.push(item.replace(/belong.*[0-9a-f]{12}\s/g, ''))});
        newErrors = newErrors.join(".<br>");
        UtilService.lnotify(newErrors, true);
      }
      $scope.initDialog();
    });
  };
  
  $scope.initDialog = function() {
    async.waterfall([
      function(next) {
        // Step 1: load group users
        UtilService.showSpinner('Loading group users...');
        GroupService.getGroupUsers(group, function(users) {
          $scope.groupUsers = users || [];
          $scope.groupUserEmails = _.pluck($scope.groupUsers, 'userEmail');
          next();
        }, function(){
          $modalInstance.dismiss('error');
        });
      }, function(next) {
        // Step 1: load all users
        $scope.setAvailableUserPage(1, null, null, function() {
          initUserSelection();
          UtilService.hideSpinner();
        }, function() {
          $modalInstance.dismiss('error');
        }, true);
      }]
    );
  };
  
  $scope.addUsers = function() {
    angular.copy(_.difference($scope.availableUsers, $scope.data.toBeAssignedUsers), $scope.availableUsers);
    angular.copy(_.union($scope.groupUsers, $scope.data.toBeAssignedUsers), $scope.groupUsers);
    clearUsersSelection();
  };
  
  $scope.removeUsers = function() {
    angular.copy(_.union($scope.availableUsers, $scope.data.toBeRemovedUsers), $scope.availableUsers);
    angular.copy(_.difference($scope.groupUsers, $scope.data.toBeRemovedUsers), $scope.groupUsers);
    clearUsersSelection();
  };

  var clearUsersSelection = function() {
    $scope.data.toBeAssignedUsers = [];
    $scope.data.toBeRemovedUsers = [];
  };
  
  var initUserSelection = function() {
    clearUsersSelection();
    var groupUserEmails = _.pluck($scope.groupUsers, 'userEmail');
    var assignedUserIds = _.intersection($scope.enterpriseUserEmails, groupUserEmails);
    $scope.availableUsers = _.reject($scope.enterpriseUsers, function(user) {
      return assignedUserIds.indexOf(user.userEmail) != -1;
    });
    $scope.availableUsers = $scope.availableUsers || [];
  };
  
  $scope.getUserDisplayName = function(user) {
    if (user.firstname || user.lastname) {
      return [ user.firstname, user.lastname ].join(' ');
    }
    return user.userEmail;
  };
  
  $scope.selectAllAvailUsers = function($event) {
    if ($event.target.checked) {
      $scope.data.toBeAssignedUsers = $scope.availableUsers.slice();
    } else {
      $scope.data.toBeAssignedUsers.length = 0;
    }
  };
  
  $scope.setAvailableUserPage = function(page, searchBy, criteria, onSuccess, onFailure, continueSpinner) {
    UtilService.showSpinner('Loading enterprise users...');
    var searchInfo = {"sortOrder":"ASC", "sortFields":["firstName","lastName","email"] };
    if (searchBy && criteria) {
      searchInfo[searchBy.value] = criteria;
    }
    page = page || 1;
    $scope.currentPage = page;
    var pageInfo = {
      start: (page - 1) * $scope.usersPerPage,
      limit: $scope.usersPerPage
    }
    EnterpriseService.searchPaginatedEnterpriseUsers(searchInfo, pageInfo, function(result, pgInfo) {
      $scope.enterpriseUsers = result.entUsers || [];
      $scope.pageInfo = pgInfo;
      $scope.enterpriseUserEmails = _.pluck($scope.enterpriseUsers, 'userEmail');
      initUserSelection();
      if (!continueSpinner) UtilService.hideSpinner();
      if (onSuccess) onSuccess();
    }, onFailure);
  }

})
.controller('GroupAssignSubGroupController', function ($scope, $modalInstance, data, UtilService, GroupService) {
  
  $scope.data = data || {};
  var group = $scope.data;
  
  $scope.cancel = function() {
    $modalInstance.dismiss('canceled');
  };

  $scope.save = function() {
    UtilService.showSpinner('Maintaining Subgroups...');
    var groupsIdChosen = _.pluck($scope.assignedGroups, 'id');
    var addGroups = _.difference(groupsIdChosen, $scope.assignedGroupIds);
    var deleteGroups = _.difference($scope.assignedGroupIds, groupsIdChosen);
    GroupService.saveSubgroups(group, addGroups, deleteGroups, function() {
      $modalInstance.close();
    }, function(result) {
      if (result) {
        var errors = UtilService.parseRelationshipErrorMessage(result, 'Some relationships are ');
        UtilService.lnotify(errors, true);
      }
      $scope.initDialog();
    });
  };

  $scope.initDialog = function() {
    async.waterfall([
      function(next) {
        // Step 1: load assigned sub groups
        UtilService.showSpinner('Loading assigned groups...');
        GroupService.getSubGroups(group, function(groups) {
          $scope.assignedGroups = groups || [];
          $scope.assignedGroupIds = _.pluck($scope.assignedGroups, 'id');
          next();
        }, function(){
          $modalInstance.dismiss('error');
        });
      }, function(next) {
        // Step 2: load all groups
        UtilService.showSpinner('Loading all groups...');
        GroupService.getGroups(function(entGroups) {
          $scope.availableGroups = _.reject(entGroups, function(group) {
            if (group.id == $scope.data.id) return true; // remove self
            return false;
          });
          initGroupSelection();
          UtilService.hideSpinner();
        }, function(){
          $modalInstance.dismiss('error');
        });
      }]
    );
  };

  $scope.addGroups = function() {
    angular.copy(_.difference($scope.availableGroups, $scope.data.toBeAssignedGroups.slice()), $scope.availableGroups);
    angular.copy(_.union($scope.assignedGroups, $scope.data.toBeAssignedGroups.slice()), $scope.assignedGroups);
    clearGroupSelection();
  };
  
  $scope.removeGroups= function() {
    angular.copy(_.union($scope.availableGroups, $scope.data.toBeRemovedGroups.slice()), $scope.availableGroups);
    angular.copy(_.difference($scope.assignedGroups, $scope.data.toBeRemovedGroups.slice()), $scope.assignedGroups);
    clearGroupSelection();
  };
  
  function clearGroupSelection() {
    $scope.data.toBeAssignedGroups = [];
    $scope.data.toBeRemovedGroups = [];
  };
  
  var initGroupSelection = function() {
    clearGroupSelection();
    var assignedGroupIds = $scope.assignedGroupIds;
    $scope.availableGroups = _.reject($scope.availableGroups, function(group) {
      if (assignedGroupIds.indexOf(group.id) != -1) return true;
//      if (group.id == $scope.data.id) return true; // remove self
      return false;
    });
    $scope.availableGroups = $scope.availableGroups || [];
  };

})
.controller('GroupAssignProductRoleController', function ($scope, $modalInstance, data, UtilService, ProductService, RoleService, GroupService) {

    $scope.data = data || {};
    var group = $scope.data;

    $scope.cancel = function() {
      $modalInstance.dismiss('canceled');
    };

    $scope.save = function() {
      UtilService.showSpinner('Maintaining roles...');
      var roldsIdChosen = [];
      _.each($scope.assignedRoles, function(role) { roldsIdChosen.push(role.role.id) });
      var addRoles = _.difference(roldsIdChosen, $scope.assignedRoleIds);
      var deleteRoles = _.difference($scope.assignedRoleIds, roldsIdChosen);
      GroupService.saveGroupRoles(group, addRoles, deleteRoles, function() {
        $modalInstance.close();
      }, function(list) {
        if (list) {
          var errors = UtilService.parseRelationshipErrorMessage(list, 'Some relationships are ');
          UtilService.lnotify(errors, true);
        }
        $scope.initDialog();
      });
    };

    $scope.initDialog = function() {

      async.waterfall([
        function(next) {
          // Step 1: load products
          UtilService.showSpinner('Loading products...');
          ProductService.getProducts(function(products) {
            $scope.data.products = products.resources || [];
            next();
          }, function(){
            $modalInstance.dismiss('error');
          });
        }, function(next) {
          // Step 2: load assigned product roles
          UtilService.showSpinner('Loading product roles...');
          $scope.assignedRoles = [];
          GroupService.getGroupRoles(group, function(result) {
            $scope.assignedRoles = result.lists;
            $scope.assignedRoleIds = [];
            _.each($scope.assignedRoles, function(role) { $scope.assignedRoleIds.push(role.role.id) });
            initRoleSelection();
            UtilService.hideSpinner();
          }, function(){
            $modalInstance.dismiss('error');
          });
        }]
      );
    };

    $scope.loadProductRoles = function(selectedProduct) {
      UtilService.showSpinner('Loading product roles...');
      $scope.selectedProduct = selectedProduct;
      $scope.availRoles = [];
      clearRoleSelection();
      if (!selectedProduct) {
        UtilService.hideSpinner();
        return;
      }
      RoleService.getProductRoles($scope.selectedProduct, function(result) {
        $scope.availRoles = UtilService.deferentRoles(result.lists, $scope.assignedRoles);
        UtilService.hideSpinner();
      });
    };

    $scope.addRoles = function() {
      $scope.assignedRoles = _.union($scope.assignedRoles, $scope.data.toBeAssignedRoles);
      $scope.availRoles = _.difference($scope.availRoles, $scope.data.toBeAssignedRoles);
      clearRoleSelection();
    };

    $scope.removeRoles = function() {
      if ($scope.selectedProduct) {
        $scope.availRoles = _.union($scope.availRoles, _.where($scope.data.toBeRemovedRoles, { productId: $scope.selectedProduct.id }));
      }
      $scope.assignedRoles = _.difference($scope.assignedRoles, $scope.data.toBeRemovedRoles);
      clearRoleSelection();
    };

    function clearRoleSelection() {
      $scope.data.toBeAssignedRoles = [];
      $scope.data.toBeRemovedRoles = [];
    };

    var initRoleSelection = function () {
      clearRoleSelection();
    };
});

