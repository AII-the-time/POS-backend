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
