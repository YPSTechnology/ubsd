import { Service } from '../index';

const service = new Service();

service.createService('myService', {ip: '127.0.0.1', port: 3000});
service.start();