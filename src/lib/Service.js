import dgram from 'dgram';
import os from 'os';

export default class Service {
    createService(serviceName, msg, broadcastPort) {
        if (!serviceName) {
            throw new Error('createService: Invalid serviceName');
        }
        this.serviceName = serviceName;
        this.msg = msg;
        this.broadcastPort = broadcastPort || 10240;
        this.broadcastAddress = this.getBroadcastAddress();
    }

    start() {
        this.server = dgram.createSocket("udp4");
        this.server.bind(() => {
            this.server.setBroadcast(true);
            this.token = Date.now();
            this.broadcast();
            this.timer = setInterval(this.broadcast.bind(this), 10000);
        });
    }

    stop() {
        clearInterval(this.timer);
    }

    broadcast() {
        const msg = {
            serviceName: this.serviceName,
            token: this.token,
            msg: this.msg
        };
        const buf = new Buffer(JSON.stringify(msg));
        this.broadcastAddress.forEach((address) => this.server.send(buf, 0, buf.length, this.broadcastPort, address));
    }

    getBroadcastAddress() {
        let broadcastAddress = [];
        const interfaces = os.networkInterfaces();
        for (const itf in interfaces) {
            for (const item of interfaces[itf]) {
                if (itf.indexOf('docker') === -1 && itf.indexOf('VMware') === -1 && item.address !== '127.0.0.1' && item.family === 'IPv4') {
                    const addressArray = item.address.split('.');
                    let address = [];
                    addressArray.forEach((a) => address.push(parseInt(a)));
                    const netmaskArray = item.netmask.split('.');
                    let netmask = [];
                    netmaskArray.forEach((n) => netmask.push(parseInt(n)));
                    let ip = new Array(4);
                    ip[0] = ((address[0] & netmask[0]) + (~netmask[0] & 0xFF));
                    ip[1] = ((address[1] & netmask[1]) + (~netmask[1] & 0xFF));
                    ip[2] = ((address[2] & netmask[2]) + (~netmask[2] & 0xFF));
                    ip[3] = ((address[3] & netmask[3]) + (~netmask[3] & 0xFF));
                    broadcastAddress.push(`${ip[0]}.${ip[1]}.${ip[2]}.${ip[3]}`);
                }
            }
        }
        return broadcastAddress;
    }
}