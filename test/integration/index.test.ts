import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll,describe } from '@jest/globals';
import init from './0. init';
import register from './1. register';
import order from './2. order';
import update from './3. update';
import del from './4. delete';

const app: FastifyInstance = await server();

afterAll(async () => {
    await app.close();
});

describe('init',init(app));
describe('register',register(app));
describe('order',order(app));
describe('update',update(app));
describe('delete',del(app));


// const tests:[string, (app: FastifyInstance) => () => void][] = [
//     ['basic', basic],
//     ['hook', hook],
//     ['login', login],
//     ['store CRU', store],
//     ['get stock, mixed stock, menu, mileage before register', getBeforeRegister],
//     ['register stock, mixed stock, menu', registerMenu],
//     ['get stock, mixed stock, menu after register', getAfterRegister],
//     ['preorder', registerPreorder],
//     ['mileage', registerMileage],
//     ['order', registerOrder],
//     ['get stock, mixed stock, menu, mileage after order', getAfterOrder],
//     ['update stock, mixed stock, menu', update],
//     ['get order, stock, mixed stock, menu after update', getAfterUpdate],
//     ['delete order, stock, mixed stock, menu', del],
//     ['get order, stock, mixed stock, menu, mileage after delete', getAfterDelete],
// ];
