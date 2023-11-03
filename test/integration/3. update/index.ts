import { FastifyInstance } from 'fastify';
import { afterAll, describe} from '@jest/globals';


const tests:[string, (app: FastifyInstance) => () => void][] = [
];

export default (app: FastifyInstance) => () => {
    tests.forEach(([name, test]) => {
        describe(name, test(app));
    });
};
