'use strict';

describe('Controller: ProfileController', function () {

  // load the controller's module
  beforeEach(module('IdMClientApp'));

  var scope, httpBackend, profileController, userService, webIdService;
  
  var mockAccountInfo = {
    'OutAccountInfoAggregate': {
      'accountInfo': {
        'accountState': 'A',
        'accountType': 'CONSUMER',
        'country': 'US',
        'email': 'testdev1@yopmail.com',
        'enabled': true,
        'enterpriseId': '6b823957-8d2c-11e2-b629-0800278eb971',
        'firstName': 'Test',
        'guid': '8b6ab0ea-872d-11e3-8cd8-d89d672a6d61',
        'hasCR': true,
        'id': '8b6ab0ea-872d-11e3-8cd8-d89d672a6d61',
        'idProvider': 'Phoenix',
        'language': 'en',
        'lastName': 'Dev1'
      }
    }
  };

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $httpBackend, $rootScope, $location, CountryService, LanguageService, UserService, WebIdService, UtilService) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    userService = UserService;
    webIdService = WebIdService;
    profileController = $controller('ProfileController', {
      $scope: scope,
      $location: {
        search: function() {
          return {
            token: 'testToken',
            email: 'testdev1@yopmail.com'
          }
        }
      },
      CountryService: CountryService,
      LanguageService: LanguageService,
      UserService: UserService,
      WebIdService: WebIdService,
      UtilService: UtilService
    });
  }));

  it('should be able to load user profile successfully', function() {
    httpBackend.expectPOST('/identitymanagement/services/userAggregate').respond(mockAccountInfo);
    scope.initProfile();
    httpBackend.flush();
    var expectedUser = mockAccountInfo.OutAccountInfoAggregate.accountInfo;
    expect(scope.user).toEqual(jasmine.objectContaining({
      firstName: expectedUser.firstName,
      lastName: expectedUser.lastName,
      email: expectedUser.email,
      emailConfirm: expectedUser.email,
      country: expectedUser.country,
      language: expectedUser.language
    }));
  });

  it('should be able to save user profile successfully', function(done) {
    scope.user = mockAccountInfo.OutAccountInfoAggregate.accountInfo;
    scope.appForm = {
      email: { $dirty: false }
    };
    spyOn(userService, 'updateWebIdUser').and.callFake(function(token, user, onSuccess) {
      expect(user).toEqual(scope.user);
      onSuccess();
    });
    spyOn(userService, 'changeEmailAddress');
    spyOn(userService, 'changeAccountPassword');
    spyOn(webIdService, 'resultRedirect');
    scope.updateUser(function(err, result) {
      // must update user and redirect to result page.
      expect(userService.updateWebIdUser).toHaveBeenCalled();
      expect(webIdService.resultRedirect).toHaveBeenCalled();
      // no email or password change
      expect(userService.changeEmailAddress).not.toHaveBeenCalled();
      expect(userService.changeAccountPassword).not.toHaveBeenCalled();
      done();
    });
  });
  
  it('should be able to change user password successfully');
  
  it('should be able to change user email successfully');

});
