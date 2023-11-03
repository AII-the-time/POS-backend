import { FastifyInstance } from 'fastify';
import { afterAll, describe} from '@jest/globals';
import preorder from './preorder';
import order from './order';
import checkStock from './checkStock';
import checkMixedStock from './checkMixedStock';
import checkMenu from './checkMenu';
import checkMileage from './checkMileage';

const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['preorder', preorder],
    ['order', order],
    ['check stock after order', checkStock],
    ['check mixed stock after order', checkMixedStock],
    ['check menu after order', checkMenu],
    ['check mileage after order', checkMileage],
];

export default (app: FastifyInstance) => () => {
    tests.forEach(([name, test]) => {
        describe(name, test(app));
    });
};
