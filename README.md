## About
[ubsd](https://github.com/YPSTechnology/ubsd) is an udp broadcast service discovery component for nodejs.


## Installation
    npm install ubsd
    
## Quickstart
### Server side
```javascript
const ubsd = require('ubsd');
const service = new ubsd.Service();
service.createService('myServiceName', {port: 3000});
service.start();
```

### Client side
```javascript
const ubsd = require('ubsd');
const discoverer = new ubsd.Discoverer();

discoverer.listen('myServiceName');

discoverer.on('serviceUp', (data) => {
    console.log('serviceUp', data); // {msg: {port: 3000}, address: '192.168.1.100'}
});

discoverer.on('serviceDown', () => {
    console.log('serviceDown');
});
```

## API
### Service constructor
Firstly, you need to construct a Service instance.
```javascript
const service = new ubsd.Service();
```

### createService(`serviceName`, `msg`, `broadcastPort`)
Create a service based on the `serviceName`.
* `serviceName` - (String, Require) Your service name.
* `msg` - (Any, Optional, Default `undefined`) What to be sent in the udp broadcast.
* `broadcastPort` - (Number, Optional, Default `10240`) udp broadcast port.

### start()
Start to send udp broadcast. Client(s) will receive `serviceUp`.

### stop()
stop udp broadcast. Client(s) will receive `serviceDown`. If the server side crashed, client(s) will receive `serviceDown` as well.

### Discoverer constructor
Client needs to construct a Discoverer instance.
```javascript
const discoverer = new ubsd.Discoverer();
```

### listen(`serviceName`, `broadcastPort`)
Listen the udp broadcast of `serviceName`.
* `serviceName` - (String, Require) Listen which service.
* `broadcastPort` - (Number, Optional, Default `10240`) udp broadcast port. Must be consistent with `createService`.

### Event `serviceUp`
This event is fired when find a new matched service. `data` is a object, containing the second parameter of `createService` and service `address`.
```javascript
discoverer.on('serviceUp', (data) => {
    console.log('serviceUp', data);
});
```
### Event `serviceDown`
This event is fired when it can not receive udp broadcast from the specified service or when the service restart.