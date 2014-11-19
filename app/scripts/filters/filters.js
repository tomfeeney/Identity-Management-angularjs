'use strict';

angular.module('IdMClientApp').filter('decode', function() {
  return window.decodeURIComponent;
})
.filter('findLabel', function(filterFilter) {
  return function(value, kvarr, vKey, lKey) {
    if (!value) return value;
    var search = {}; search[vKey || 'code'] = value;
    var selected = filterFilter(kvarr, search);
    return selected.length ? selected[0][lKey || 'name'] : null;
  };
})
.filter('displayRoles', function(filterFilter) {
  return function(roles) {
    if (!roles) return roles;
    var names = [];
    angular.forEach(roles, function(role) {
      names.push(role.role);
    });
    return names.join(', ');
  };
})
.filter('isEmpty', function() {
  return function(input) {
    return _.isEmpty(input);
  }
});