import { FastifyInstance } from 'fastify';
import { afterAll, describe} from '@jest/globals';
import createWithoutParams from './createWithoutParams';

const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['create without params', createWithoutParams],
];

export default (app: FastifyInstance) => () => {
    tests.forEach(([name, test]) => {
        describe(name, test(app));
    });
};
