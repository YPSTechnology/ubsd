'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Service = function () {
    function Service() {
        _classCallCheck(this, Service);
    }

    _createClass(Service, [{
        key: 'createService',
        value: function createService(serviceName, msg, broadcastPort) {
            if (!serviceName) {
                throw new Error('createService: Invalid serviceName');
            }
            this.serviceName = serviceName;
            this.msg = msg;
            this.broadcastPort = broadcastPort || 10240;
            this.broadcastAddress = this.getBroadcastAddress();
        }
    }, {
        key: 'start',
        value: function start() {
            var _this = this;

            this.server = _dgram2.default.createSocket("udp4");
            this.server.bind(function () {
                _this.server.setBroadcast(true);
                _this.token = Date.now();
                _this.broadcast();
                _this.timer = setInterval(_this.broadcast.bind(_this), 10000);
            });
        }
    }, {
        key: 'stop',
        value: function stop() {
            clearInterval(this.timer);
        }
    }, {
        key: 'broadcast',
        value: function broadcast() {
            var _this2 = this;

            var msg = {
                serviceName: this.serviceName,
                token: this.token,
                msg: this.msg
            };
            var buf = new Buffer(JSON.stringify(msg));
            this.broadcastAddress.forEach(function (address) {
                return _this2.server.send(buf, 0, buf.length, _this2.broadcastPort, address);
            });
        }
    }, {
        key: 'getBroadcastAddress',
        value: function getBroadcastAddress() {
            var broadcastAddress = [];
            var interfaces = _os2.default.networkInterfaces();
            for (var itf in interfaces) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = interfaces[itf][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var item = _step.value;

                        if (itf.indexOf('docker') === -1 && itf.indexOf('VMware') === -1 && item.address !== '127.0.0.1' && item.family === 'IPv4') {
                            (function () {
                                var addressArray = item.address.split('.');
                                var address = [];
                                addressArray.forEach(function (a) {
                                    return address.push(parseInt(a));
                                });
                                var netmaskArray = item.netmask.split('.');
                                var netmask = [];
                                netmaskArray.forEach(function (n) {
                                    return netmask.push(parseInt(n));
                                });
                                var ip = new Array(4);
                                ip[0] = (address[0] & netmask[0]) + (~netmask[0] & 0xFF);
                                ip[1] = (address[1] & netmask[1]) + (~netmask[1] & 0xFF);
                                ip[2] = (address[2] & netmask[2]) + (~netmask[2] & 0xFF);
                                ip[3] = (address[3] & netmask[3]) + (~netmask[3] & 0xFF);
                                broadcastAddress.push(ip[0] + '.' + ip[1] + '.' + ip[2] + '.' + ip[3]);
                            })();
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            return broadcastAddress;
        }
    }]);

    return Service;
}();

exports.default = Service;