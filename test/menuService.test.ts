import server from '../src';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';

let app: FastifyInstance;

beforeAll( async () =>{
    app = await server();
});

afterAll(async () =>{
    await app.prisma.$disconnect();
    await app.close();
});

describe('api test', () => {
    test('ping test', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/ping'
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({data: 'pong'});
        console.log("ping done");
    });

    test('menu test', async () => {
        const testStoreId = (await app.prisma.store.findFirst({
            where: {
                name: '소예다방'
            }
        }))?.id;
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/${testStoreId}`
        });
        expect(response.statusCode).toBe(200);
        await app.close();
    });
});
