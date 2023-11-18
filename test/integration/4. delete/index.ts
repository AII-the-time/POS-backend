import { FastifyInstance } from 'fastify';
import { afterAll, describe} from '@jest/globals';
import deleteStock from './deleteStock';
import deleteMenu from './deleteMenu';
import cancelOrder from './cancelOrder';

const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['delete stock', deleteStock],
    ['delete menu', deleteMenu],
    ['cancle order', cancelOrder],
];

export default (app: FastifyInstance) => () => {
    tests.forEach(([name, test]) => {
        describe(name, test(app));
    });
};
