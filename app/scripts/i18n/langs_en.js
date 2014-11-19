'use strict';

angular.module('IdMClientApp')
.constant('langs_en', {
  "common": {
    "ok": "OK",
    "cancel": "Cancel"
  },
  "error": {
    'COMMON-012': 'Access denied due to insufficient permissions.',
    'DUPLICATED_GROUP': 'Group name is in use',
    'PAMS1137': 'The credentials you provided were not valid. Please try again.',
    'PAMS1018': 'Answer is incorrect. Try again.',
    'PAMS1100': 'Please recheck the email and password you\'ve provided, and try again.',
    'PAMS1102': '@:error.PAMS1100',
    'PAMS1008': 'Email address is already in use, please use another email address to continue.',
    'PAMS1034': '@:error.PAMS1008',
    'PAMS1005': '@:error.PAMS1100',
    'ENT-GROUP-016':'Parent group cannot be added as the subgroup of its child group.',
    'PAMS8100': 'Invalid id.'
  },
  "title": {
    '/passwordreset': 'Password Reset',
    '/roles': 'Role & Permission',
    '/login': 'Sign In',
    '/changepassword': 'Change Password'
  },
  "spinner": {
    "signing_up": "Signing Up...",
    "signing_in": "Signing In..."
  },
  "login": {
    "email": "Email Address",
    "password": "Password",
    "auth_provider": "Select an Authentication Provider",
    "forgot_password": "I forgot my password",
    "secure_login": "Securely log in using <b>HP Web ID</b>",
    "signup": "Sign up",
    "for_webid": "for HP WEB ID"
  },
  "webid.authorizing" : "Authorizing..."
});