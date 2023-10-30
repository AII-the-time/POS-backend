import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll, describe, expect, test } from '@jest/globals';
import basic from './basic';
import hook from './hook';
import login from './login';
import store from './store';
import getBeforeRegister from './getBeforeRegister';
import registerMenu from './registerMenu';
import getAfterRegister from './getAfterRegister';
import registerPreorder from './registerPreorder';
import registerMileage from './registerMileage';
import registerOrder from './registerOrder';
import getAfterOrder from './getAfterOrder';
import update from './update';
import getAfterUpdate from './getAfterUpdate';
import del from './delete';
import getAfterDelete from './getAfterDelete';

const app: FastifyInstance = await server();

afterAll(async () => {
    await app.close();
});

const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['basic', basic],
    ['hook', hook],
    ['login', login],
    ['store CRU', store],
    ['get stock, mixed stock, menu, mileage before register', getBeforeRegister],
    ['register stock, mixed stock, menu', registerMenu],
    ['get stock, mixed stock, menu after register', getAfterRegister],
    ['preorder', registerPreorder],
    ['mileage', registerMileage],
    ['order', registerOrder],
    ['get stock, mixed stock, menu, mileage after order', getAfterOrder],
    ['update stock, mixed stock, menu', update],
    ['get order, stock, mixed stock, menu after update', getAfterUpdate],
    ['delete order, stock, mixed stock, menu', del],
    ['get order, stock, mixed stock, menu, mileage after delete', getAfterDelete],
];

tests.forEach(([name, test]) => {
    describe(name, test(app));
});
