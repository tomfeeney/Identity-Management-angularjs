var winston = require('winston');
var path = require('path');

var w = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ 'json': false, 'colorize': true, 'timestamp':true})
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ 'json': false, 'colorize': true, 'timestamp':true})
    ],
    exitOnError: false
});

var logger = exports;
logger.levels = ['error', 'warn', 'info'];
logger.debugLevel = 'info';

var localIp = "";
try{
    localIp = require('os').networkInterfaces().eth0[0].address;
} catch(err) {
    console.log("could not get local ip", err);
}

var globalArgs = ["idmservice"];

function getFileLine() {
    var e = new Error();    
    var stack = e.stack.split('\n')[4].split(':');
    var index = 1;
    if(stack[0][stack.length] == 'C'){
        index++;
    }
	return path.basename(stack[index]) + ":" + stack[++index];
}

logger.output = function() {    
    var args = arguments;
    //args = Array.prototype.slice.call(arguments);
    var level = args[0];
    var message = args[1];
    
    if (logger.levels.indexOf(level) <= logger.levels.indexOf(logger.debugLevel) ) {  
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        };
        var address = "";
        if(localIp && localIp != ""){
            address = '['+localIp+']';
        }
        w.log(level, address, '['+globalArgs[0]+']', '['+getFileLine()+']', message);        
    }
}

logger.log = function(messages) {
    // var args = Array.prototype.slice.call(arguments);    
    // args.splice(0,0,'info');
    // return this.output.apply(this, args);
    return this.output('info', messages);
}
logger.info = function(messages) {
    return this.output('info', messages);
}
logger.warn = function(messages) {
    return this.output('warn', messages);
}
logger.error = function(messages) {
    return this.output('error', messages);
}
logger.setup = function(config){
  if(config.outputToConsole == false){
    w.remove(winston.transports.Console);
  }

  if(config.transportLogFile && config.transportLogFile != ""){
    var params = {
      'filename': config.transportLogFile,
      'json': false,
      'timestamp': true,
      'datePattern': '.dd-MM-yyyy'
    };
    if(config.maxsize){ params["maxsize"] = config.maxsize; }
    if(config.maxFiles){ params["maxFiles"] = config.maxFiles; }
    w.add(winston.transports.DailyRotateFile, params);

  }
}
