'use strict';

var express = require('express');

var nconf = require('nconf');
var http = require('http');

var webApp = express();
//webApp.use(express.logger());

var proxy = require('./utils/proxy');
var logger = require('./utils/logger');

// Then load configuration from a designated file.
nconf.file({ file: './config/config.json' });
nconf.argv().env();

var localConfig = nconf.get("localServer");

var logconfig = nconf.get("loggerConfig");
logger.setup(logconfig);

webApp.configure(function(){
    webApp.set('port', process.env.PORT || localConfig.Port);
    webApp.use(express.favicon());
    webApp.set('views', __dirname + '/app');
    //app.set('view engine', 'jade');
    //webApp.use(express.bodyParser());
    webApp.use(express.json());
    webApp.use(express.logger('dev'));
    webApp.use(express.urlencoded());
    webApp.use(express.methodOverride());
    webApp.use(express.static(__dirname + '/app', { maxAge: 600000 /* 10 min */ }));
    webApp.use(webApp.router);
    webApp.engine('html', require('ejs').renderFile);
});

webApp.get('/', function(request, response) {
    response.render('index.html');
});

webApp.get('/locale', function(request, response) {
  var locale = request.headers['accept-language'].split(',')[0];
  response.send(locale);
});

webApp.get('/webid', function(request, response) {
  response.render('webid-index.html');
});

webApp.get('/authorize', function(request, response) {
  response.render('authorize-index.html');
});

webApp.get('/identitymanagement/healthcheck', function (request, response) {
    response.send('ack');
});

webApp.get('/identitymanagement/about', function (request, response) {
    response.send('<html><body><div id=\"page\"><div style=\"padding: 80px 0px 0px 15px;\">Identity Management Service<br/><br/><table class=\"version\"><tr><th>Version</th><td>1.0.0</td></tr></table></div></div></body></html>');
});

webApp.all('/identitymanagement/services/*', proxy.proxyRequest);


http.createServer(webApp).listen(webApp.get('port'), function(){
    logger.info('Identity Management Service listening on port: ' + webApp.get('port'));
});

