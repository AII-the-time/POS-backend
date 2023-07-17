import server from '../src';
import { FastifyInstance } from 'fastify';
import {describe, expect, test} from '@jest/globals';

describe('api test', () => {
    test('ping test', async () => {
        const app: FastifyInstance = await server();
        await app.ready();
        const response = await app.inject({
            method: 'GET',
            url: '/api/ping'
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({data: 'pong'});
        await app.close();
    });

    test('menu test', async () => {
        const app: FastifyInstance = await server();
        await app.ready();
        const response = await app.inject({
            method: 'GET',
            url: '/api/menu?storeId=1'
        });

        expect(response.statusCode).toBe(200);
        await app.close();
    });

    test('order test', async () => {
        const app: FastifyInstance = await server();
        await app.ready();
        const response = await app.inject({
            method: 'GET',
            url: '/api/menu?storeId=1'
        });

        expect(response.statusCode).toBe(200);
        await app.close();
    });
});
