import EventEmitter from 'events';
import dgram from 'dgram';

export default class Discoverer extends EventEmitter {
    listen(serviceName, broadcastPort) {
        if (!serviceName) {
            throw new Error('listen: Invalid serviceName');
        }
        this.serviceName = serviceName;
        this.broadcastPort = broadcastPort || 10240;
        this.emitServer = false;

        this.server = dgram.createSocket("udp4");
        this.server.on("error", (error) => {
            throw error;
        });
        this.server.on("message", (rawMsg, rinfo) => {
            try {
                const obj = JSON.parse(rawMsg);
                if (this.serviceName === obj.serviceName) {
                    this.discoverTime = Date.now();
                    if (this.emitServer) {
                        if (this.token !== obj.token) {
                            this.token = obj.token;
                            this.emit('serviceDown');
                            setTimeout(() => this.emit('serviceUp', {
                                msg: obj.msg,
                                address: rinfo.address
                            }), 0);
                        }
                    } else {
                        this.emit('serviceUp', {
                            msg: obj.msg,
                            address: rinfo.address
                        });
                        this.token = obj.token;
                        this.emitServer = true;
                    }
                }
            } catch (error) {
                console.error(error);
            }
        });
        this.server.bind(this.broadcastPort);
        setInterval(this.reportServiceDown.bind(this), 15000);
    }

    reportServiceDown() {
        if (!this.emitServer) {
            return;
        }
        if (Date.now() - this.discoverTime >= 15000) {
            this.emit('serviceDown');
            this.emitServer = false;
        }
    }
}