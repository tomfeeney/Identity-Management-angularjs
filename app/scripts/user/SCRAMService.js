'use strict';

angular.module('IdMClientApp').service('SCRAMService', function (ConfigService, $http) {

  var clientNonce = null;
  var clientFirstMessageBare = null;
  var instance = null;

  this.apply = function(email, password, authProvider, options, onSuccess, onFailure) {
    
    // skip scram if is scram whitelisted
    if (ConfigService.noScram(authProvider)) {
      onSuccess(password);
      return;
    };
    
    var email = angular.lowercase(email);
    var self = this;
    async.waterfall([
      function(next) {
        self.acquireSalt(email, authProvider, options, function(data) {
          if (data) {
            next(null, data);
          } else {
            next({ errorDescription: 'Acquiring Salt failed!' });
          }
        }, onFailure);
      }, function(data, next) {
        try {
          var instance = self.genScram(data, password, options);
        } catch (e) {
          next(e, data);
          return;
        }
        onSuccess(instance.message);
      }
    ], function(err, result) {
      err = err || {};
      err.isScramError = true;
      onFailure(err);
    });

  };

  this.acquireSalt = function(email, idProvider, options, onSuccess, onFailure) {

    clientNonce = genNonce(randomInt(20, 30));
    clientFirstMessageBare = [ 'n=' + email, 'r=' + clientNonce ].join(',');

    options = resolveOptions(options);

    var payload = {
      application: options.application || 'HPWebID',
      step: options.createSalt ? 'Create' : 'Initial',
      message: "n,," + clientFirstMessageBare,
      idProvider: idProvider
    };

    $http({
      method: 'POST',
      url: ConfigService.getEndpoint() + '/identitymanagement/services/getScramInfo',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
      data: { InChallengeRequest: payload }
    }).success(function(data, status, headers, config) {
      onSuccess(data.OutChallengeResponse);
    }).error(function(error) {
      if (onFailure) {
        error = error || {};
        error.isScramError = true,
        onFailure(error);
      }
    });

  };

  this.genScram = function(data, password, options) {

    options = resolveOptions(options);
    var msg = parseMessage(data.message);
    var response = { c: 'biws', r: msg.r };
    if (msg.clientNonce !== clientNonce) {
      throw { errorDescription: 'Nonce not match!' };
    }

    var d = {};

    // AuthMessage     := client-first-message-bare + "," + server-first-message + "," + client-final-message-without-proof
    d.authMessage = [ clientFirstMessageBare, data.message, genMessage(response).message ].join(',');

    // if non scram user
    if ((msg.s || '' === '') && msg.i === 0) {
      d.serverSignature = CryptoJS.HmacSHA1(d.authMessage, "Server Key");
      response.p = CryptoJS.enc.Utf8.parse(password).toString(CryptoJS.enc.Base64).replace("=", "");
      return genMessage(response, d);
    }

    // SaltedPassword  := Hi(Normalize(password), salt, i)
    d.saltedPassword = Hi(password, msg.s, msg.i);
    // ClientKey       := HMAC(SaltedPassword, "Client Key")
    d.clientKey = CryptoJS.HmacSHA1("Client Key", d.saltedPassword);
    // StoredKey       := H(ClientKey)
    d.storedKey = CryptoJS.SHA1(d.clientKey);
    // ClientSignature := HMAC(StoredKey, AuthMessage)
    d.clientSignature = CryptoJS.HmacSHA1(d.authMessage, d.storedKey);
    // ClientProof     := ClientKey XOR ClientSignature
    d.clientProof = XOR(d.clientKey, d.clientSignature);
    // ServerKey       := HMAC(SaltedPassword, "Server Key")
    d.serverKey = CryptoJS.HmacSHA1("Server Key", d.saltedPassword);
    // ServerSignature := HMAC(ServerKey, AuthMessage)
    d.serverSignature = CryptoJS.HmacSHA1(d.authMessage, d.serverKey);

    if (options.createSalt) {
      delete response.c;
      response.sp = d.saltedPassword.toString(CryptoJS.enc.Base64);
    } else {
      response.p = d.clientProof.toString(CryptoJS.enc.Base64).replace("=", "");
    }
    return genMessage(response, d);

  };

  var resolveOptions = function(options) {
    if (_.isBoolean(options)) {
      return {
        createSalt: options
      };
    }
    return options;
  };

  this.verify = function(signature) {
    return signature.substr(2) == instance.detail.serverSignature.toString(CryptoJS.enc.Base64);
  };

  var genMessage = function(response, detail) {
    var res = [];
    if (response.c) res.push('c=' + response.c);
    if (response.r) res.push('r=' + response.r);
    if (response.p) res.push('p=' + response.p);
    if (response.sp) res.push('sp=' + response.sp);
    return instance = {
      message: res.join(','),
      detail: detail || {}
    };
  };

  var parseMessage = function(message) {
    var res = parse(message);
    res.clientNonce = res.r.substr(0, clientNonce.length);
    res.serverNonce = res.r.substr(clientNonce.length);
    res.i = parseInt(res.i);
    return res;
  };

  var XOR = function(a, b) {
    for (var k = 0, l = a.words.length; k < l; k++) {
      a.words[k] ^= b.words[k];
    }
    return a;
  };

  /**
   * Iteratively create an HMAC, with a salt.
   *
   * @param {String} text
   * @param {String} salt
   * @param {Number} iterations
   * @api private
   */
  var Hi = function(p, s, itr) {
    var newP = CryptoJS.enc.Utf8.parse(p);
    var result = newP;
    var newS = CryptoJS.enc.Base64.parse(s);
    newS.concat(CryptoJS.enc.Hex.parse("00000001"));
    var Ui = CryptoJS.HmacSHA1(newS, newP);
    result = Ui.clone();
    for (var i = 1; i < itr; i++) {
      var Uj = CryptoJS.HmacSHA1(Ui, newP);
      for (var j = 0; j < result.words.length; j++) {
        result.words[j] ^= Uj.words[j];
      }
      Ui = Uj;
    }
    return result;
  };


  /**
   * Parse challenge.
   *
   * @api private
   */
  var parse = function(chal) {
    var dtives = {};
    var tokens = chal.split(/,(?=(?:[^"]|"[^"]*")*$)/);
    for (var i = 0, len = tokens.length; i < len; i++) {
        var dtiv = /(\w+)=["]?([^"]+)["]?$/.exec(tokens[i]);
        if (dtiv) {
            dtives[dtiv[1]] = dtiv[2];
        }
    }
    return dtives;
  };

  /**
   * Return a unique nonce with the given `len`.
   *
   *     genNonce(10); => "FDaS435D2z"
   *
   * @param {Number} len
   * @return nonce
   */
  var genNonce = function(len) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charlen = chars.length;
    var buf = [];
    for (var i = 0; i < len; ++i) {
      buf.push(chars[Math.random() * charlen | 0]);
    }
    return buf.join('');
  };

  var randomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

});
