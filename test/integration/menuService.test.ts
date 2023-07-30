import server from '../../src/server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let app: FastifyInstance;

beforeAll( async () =>{
    app = await server();
});

afterAll(async () =>{
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
    });

    test('menu test', async () => {
        
    });
});
