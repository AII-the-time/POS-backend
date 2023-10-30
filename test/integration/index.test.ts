import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll, describe, expect, test } from '@jest/globals';
import basic from './basic';
import hook from './hook';
import login from './login';

const app: FastifyInstance = await server();

afterAll(async () => {
    await app.close();
});

const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['basic', basic],
    ['hook', hook],
    ['login', login],
    ['store CRU', (app: FastifyInstance) => () => {}],
    ['get stock, mixed stock, menu, mileage before register', (app: FastifyInstance) => () => {}],
    ['register stock, mixed stock, menu', (app: FastifyInstance) => () => {}],
    ['get stock, mixed stock, menu after register', (app: FastifyInstance) => () => {}],
    ['preorder', (app: FastifyInstance) => () => {}],
    ['mileage', (app: FastifyInstance) => () => {}],
    ['order', (app: FastifyInstance) => () => {}],
    ['get stock, mixed stock, menu, mileage after order', (app: FastifyInstance) => () => {}],
    ['update stock, mixed stock, menu', (app: FastifyInstance) => () => {}],
    ['get order, stock, mixed stock, menu after update', (app: FastifyInstance) => () => {}],
    ['delete order, stock, mixed stock, menu', (app: FastifyInstance) => () => {}],
    ['get order, stock, mixed stock, menu, mileage after delete', (app: FastifyInstance) => () => {}],
];

tests.forEach(([name, test]) => {
    describe(name, test(app));
});
