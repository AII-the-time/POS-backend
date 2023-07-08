import server from '../src';
import { FastifyInstance } from 'fastify';
import {describe, expect, test} from '@jest/globals';

test('ping test', async () => {
    const app: FastifyInstance = await server();
    await app.ready();
    const response = await app.inject({
        method: 'GET',
        url: '/ping'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({data: 'pong'});
    await app.close();
});
