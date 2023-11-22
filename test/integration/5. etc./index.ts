import { FastifyInstance } from 'fastify';
import { afterAll, describe} from '@jest/globals';
import createWithoutParams from './createWithoutParams';
import report from './report';
import stockHistory from './stockHistory';

const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['create without params', createWithoutParams],
    ['report', report],
    ['stock history', stockHistory],
];

export default (app: FastifyInstance) => () => {
    tests.forEach(([name, test]) => {
        describe(name, test(app));
    });
};
