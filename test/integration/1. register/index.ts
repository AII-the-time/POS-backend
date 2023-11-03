import { FastifyInstance } from 'fastify';
import { afterAll, describe} from '@jest/globals';
import stock from './stock';
import mixedStock from './mixedStock';
import menu from './menu';
import mileage from './mileage';

const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['register stock', stock],
    ['register mixed stock', mixedStock],
    ['register menu', menu],
    ['mileage', mileage],
];

export default (app: FastifyInstance) => () => {
    tests.forEach(([name, test]) => {
        describe(name, test(app));
    });
};
