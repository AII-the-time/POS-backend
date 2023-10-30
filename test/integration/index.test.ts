import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll, describe, expect, test } from '@jest/globals';
import { LoginToken } from '@utils/jwt';
import basic from './basic';
import hook from './hook';

const app: FastifyInstance = await server();

afterAll(async () => {
    await app.close();
});

const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['basic test', basic],
    ['hook test', hook],
];

tests.forEach(([name, test]) => {
    describe(name, test(app));
});
