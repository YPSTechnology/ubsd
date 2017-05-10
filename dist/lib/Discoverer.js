'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Discoverer = function (_EventEmitter) {
    _inherits(Discoverer, _EventEmitter);

    function Discoverer() {
        _classCallCheck(this, Discoverer);

        return _possibleConstructorReturn(this, (Discoverer.__proto__ || Object.getPrototypeOf(Discoverer)).apply(this, arguments));
    }

    _createClass(Discoverer, [{
        key: 'listen',
        value: function listen(serviceName, broadcastPort) {
            var _this2 = this;

            if (!serviceName) {
                throw new Error('listen: Invalid serviceName');
            }
            this.serviceName = serviceName;
            this.broadcastPort = broadcastPort || 10240;
            this.emitServer = false;

            this.server = _dgram2.default.createSocket("udp4");
            this.server.on("error", function (error) {
                throw error;
            });
            this.server.on("message", function (rawMsg, rinfo) {
                try {
                    var obj = JSON.parse(rawMsg);
                    if (_this2.serviceName === obj.serviceName) {
                        _this2.discoverTime = Date.now();
                        if (_this2.emitServer) {
                            if (_this2.token !== obj.token) {
                                _this2.token = obj.token;
                                _this2.emit('serviceDown');
                                setTimeout(function () {
                                    return _this2.emit('serviceUp', {
                                        msg: obj.msg,
                                        address: rinfo.address
                                    });
                                }, 0);
                            }
                        } else {
                            _this2.emit('serviceUp', {
                                msg: obj.msg,
                                address: rinfo.address
                            });
                            _this2.token = obj.token;
                            _this2.emitServer = true;
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            });
            this.server.bind(this.broadcastPort);
            setInterval(this.reportServiceDown.bind(this), 15000);
        }
    }, {
        key: 'reportServiceDown',
        value: function reportServiceDown() {
            if (!this.emitServer) {
                return;
            }
            if (Date.now() - this.discoverTime >= 15000) {
                this.emit('serviceDown');
                this.emitServer = false;
            }
        }
    }]);

    return Discoverer;
}(_events2.default);

exports.default = Discoverer;