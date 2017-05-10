import { Discoverer } from '../index';

const discoverer = new Discoverer();

discoverer.listen('myService');

discoverer.on('serviceUp', (msg) => {
    console.log('serviceUp', msg);
});

discoverer.on('serviceDown', () => {
    console.log('serviceDown');
});