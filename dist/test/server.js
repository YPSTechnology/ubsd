'use strict';

var _index = require('../index');

var service = new _index.Service();

service.createService('myService', { ip: '127.0.0.1', port: 3000 });
service.start();