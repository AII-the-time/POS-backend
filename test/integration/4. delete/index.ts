import { FastifyInstance } from 'fastify';
import { afterAll, describe} from '@jest/globals';
import deleteStock from './deleteStock';
import deleteMixedStock from './deleteMixedStock';
import deleteMenu from './deleteMenu';
import cancelOrder from './cancelOrder';

const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['delete stock', deleteStock],
    ['delete mixed stock', deleteMixedStock],
    ['delete menu', deleteMenu],
    ['cancle order', cancelOrder],
];

export default (app: FastifyInstance) => () => {
    tests.forEach(([name, test]) => {
        describe(name, test(app));
    });
};
