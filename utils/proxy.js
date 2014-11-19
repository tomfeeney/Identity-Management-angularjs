var http = require('http');
var https = require('https');

var logger = require('./logger');

var config = require('nconf');
config.file({ file: './config/config.json' });
config.argv().env();
var idmWebService = config.get("idmWebService");

var serviceHost = idmWebService.Hostname;
var servicePort = idmWebService.Port;

exports.proxyRequest = function(req, res) {

    logger.log("proxy.proxyRequest: " + "Endpoint: " + req.url);

    var options = {
        host : serviceHost,
        path : req.url,
        port : servicePort,
        method: req.method,
        headers : {
            'Content-Type' : "application/json"
        }
    };
    
    //This is the only line that is new. `headers` is an object with the headers to request
    [ 'Authorization', 'ID-Provider', 'X-HP-Principal-Id', 'X-HP-Enterprise-Id', 'X-HP-Client-Id' ]
    .forEach(function(h) {
        var lh= h.toLowerCase();
        if (!req.headers[lh]) return;
        options.headers[h] = req.headers[lh];
    });

    var requestString = null;
    if(options.method !== 'GET') {
        requestString = JSON.stringify(req.body);
        logger.log(requestString);
    }

    var protocol = ((options.port === 443) || (options.port === 8443)) ? https : http;

    getCallback = function (response) {
        var str =  '';
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var json = {};

            try{
                json = JSON.parse(str);
            } catch(err) {
                logger.log(err);
            }
            res.send(json);
        });
    };

    var request = protocol.request(options, getCallback);
    if(requestString !== null) {
        request.write(requestString);
    }
    request.end();
};





