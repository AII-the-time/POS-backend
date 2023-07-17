import server from '../src';
import { FastifyInstance } from 'fastify';
import { describe, expect, test } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

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
        const prisma = new PrismaClient();
        const testStoreId = (await prisma.store.findFirst({
            where: {
                name: 'test'
            }
        }))?.id;
        const app: FastifyInstance = await server();
        await app.ready();
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu?storeId=${testStoreId}`
        });
        expect(response.statusCode).toBe(200);
        const menu = JSON.parse(response.body).menus[0];
        expect(menu.name).toBe("아메리카노");
        expect(menu.price).toBe(1000);
        expect(menu.storeId).toBe(testStoreId);
        expect(menu.category).toBe("커피");

        const response2 = await app.inject({
            method: 'POST',
            url: `/api/payment/`,
            payload: {
                storeId: testStoreId,
                menus: [
                    {
                        id: menu.id,
                        count: 2
                    }
                ]
            }
        });
        expect(response2.statusCode).toBe(200);
        const payment = JSON.parse(response2.body);
        expect(payment.paymentMethod).toBe("credit");
        expect(payment.paymentStatus).toBe("paid");
        expect(payment.totalPrice).toBe(2000);
        
        await app.close();
    });
});
