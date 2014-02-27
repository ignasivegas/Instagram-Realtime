// http://expressjs.com/migrate.html
var express = require('express');

var app = express();
exports.app = app;


exports.appPort = process.env.PORT || 3000;
exports.CLIENT_ID = process.env.IG_CLIENT_ID || 'a4e8afbbf8394fcb8c0ade9cc35dd4c9'
exports.CLIENT_SECRET = process.env.IG_CLIENT_SECRET || '2a7e74af3ed042d0a9d7f45f90755214';
exports.httpClient = (process.env.IG_USE_INSECURE ? require('http') : require('https'));
exports.apiHost = process.env.IG_API_HOST || 'api.instagram.com';
exports.apiPort = process.env.IG_API_PORT || null;
exports.basePath = process.env.IG_BASE_PATH || '';
//exports.REDIS_PORT = rtg.port || 6486;
//exports.REDIS_HOST = rtg.hostname || '127.0.0.1';
exports.debug = true;

app.set('view engine', 'jade');

app.configure(function(){
    app.use(express.methodOverride());
	app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname + '/public/'));
});
app.configure('development', function(){
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
    app.use(express.errorHandler());
});