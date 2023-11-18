import { FastifyInstance } from 'fastify';
import { describe } from '@jest/globals';
import basic from './basic';
import hook from './hook';
import login from './login';
import store from './store';
import getBeforeRegister from './getBeforeRegister';


const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['basic', basic],
    ['hook', hook],
    ['login', login],
    ['store CRU', store],
    ['get stock, mixed stock, menu, mileage before register', getBeforeRegister]
];

export default (app: FastifyInstance) => () => {
    tests.forEach(([name, test]) => {
        describe(name, test(app));
    });
};
