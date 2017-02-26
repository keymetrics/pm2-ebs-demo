'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createServer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // .postgraphql


var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _postgraphql = require('postgraphql');

var _postgraphql2 = _interopRequireDefault(_postgraphql);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _hpp = require('hpp');

var _hpp2 = _interopRequireDefault(_hpp);

var _throng = require('throng');

var _throng2 = _interopRequireDefault(_throng);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultServerConfig = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT || 1337,
  timeout: 60000,
  schemaName: process.env.SCHEMA_NAME || 'public',
  databaseUrl: process.env.DATABASE_URL || 'postgres://localhost:5432'
};

var createServer = exports.createServer = function createServer(config) {
  var __PROD__ = config.nodeEnv === 'production';
  var __TEST__ = config.nodeEnv === 'test';

  var app = (0, _express2.default)();
  app.disable('x-powered-by');
  app.use((0, _morgan2.default)(__PROD__ || __TEST__ ? 'combined' : 'dev'));
  app.use((0, _cors2.default)());
  app.use((0, _helmet2.default)());
  app.use((0, _hpp2.default)());
  app.use((0, _compression2.default)());

  var optionsPostgraph = __PROD__ ? {} : { graphiql: true };
  app.use((0, _postgraphql2.default)(config.databaseUrl, config.schemaName, optionsPostgraph));

  var server = _http2.default.createServer(app);

  // Heroku dynos automatically timeout after 30s. Set our
  // own timeout here to force sockets to close before that.
  // https://devcenter.heroku.com/articles/request-timeout
  if (config.timeout) {
    server.setTimeout(config.timeout, function (socket) {
      var message = 'Timeout of ' + config.timeout + 'ms exceeded';

      socket.end(['HTTP/1.1 503 Service Unavailable', 'Date: ' + new Date().toGMTString(), // eslint-disable-line
      'Content-Type: text/plain', 'Content-Length: ' + message.length, 'Connection: close', '', message].join('\r\n'));
    });
  }

  return server;
};

var startServer = function startServer(serverConfig) {
  var config = _extends({}, DefaultServerConfig, serverConfig);

  var server = createServer(config);
  server.listen(config.port, function (err) {
    if (err) console.log(err);
    console.log('server ' + config.id + ' listening on port ' + config.port);
  });
};

if (require.main === module) {
  (0, _throng2.default)({
    start: function start(id) {
      return startServer({ id: id });
    },
    workers: process.env.WEB_CONCURRENCY || 1,
    lifetime: Infinity
  });
}
