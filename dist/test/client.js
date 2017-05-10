'use strict';

var _index = require('../index');

var discoverer = new _index.Discoverer();

discoverer.listen('myService');

discoverer.on('serviceUp', function (msg) {
    console.log('serviceUp', msg);
});

discoverer.on('serviceDown', function () {
    console.log('serviceDown');
});