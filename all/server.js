'use strict';

require('dotenv').config()
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var rateLimit = require('express-rate-limit');
var helmet = require('helmet');
var port = process.env.VCAP_APP_PORT || process.env.PORT || 3000;
var http = require('http').Server(app);
var debug = require('debug')('bot:server');

// Deployment tracking
require('cf-deployment-tracker-client').track();

// configure express
app.use(helmet());
app.use('/api/', rateLimit({
  windowMs: 60 * 1000, // seconds
  delayMs: 0,
  max: 15
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// Helper Function to check for enviornment variables
var checkAndRequire = function(envItem, toRequire, debugMessage) {
  if (envItem && envItem.match(/true/i)) {
    if (debugMessage) {
        debug(debugMessage);
    }
    require(toRequire)(app,controller);
  }
};

// configure the channels
var controller = require('./controller');
checkAndRequire(process.env.USE_WEBUI, './web-ui', 'Initializing WebUI');

http.listen(port, function () {
  debug('Server listening on port: ' + port);
});

module.exports = http
