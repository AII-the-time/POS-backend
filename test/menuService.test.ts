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
                name: '소예다방'
            }
        }))?.id;
        const app: FastifyInstance = await server();
        await app.ready();
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/${testStoreId}`
        });
        expect(response.statusCode).toBe(200);
        const menu = JSON.parse(response.body).menus[0];
        expect(menu.name).toBe("아메리카노");
        expect(menu.price).toBe(2000);
        expect(menu.storeId).toBe(testStoreId);
        expect(menu.category).toBe("커피");

        const menu2 = JSON.parse(response.body).menus[1];
        expect(menu2.name).toBe("아이스티");
        expect(menu2.price).toBe(2500);
        expect(menu2.storeId).toBe(testStoreId);
        expect(menu2.category).toBe("티&에이드");

        const response2 = await app.inject({
            method: 'POST',
            url: `/api/payment/`,
            payload: {
                storeId: testStoreId,
                menus: [
                    {
                        id: menu.id,
                        count: 2
                    },
                    {
                        id: menu2.id,
                        count: 1
                    }
                ]
            }
        });
        expect(response2.statusCode).toBe(200);
        const payment = JSON.parse(response2.body);
        expect(payment.paymentMethod).toBe("credit");
        expect(payment.paymentStatus).toBe("paid");
        expect(payment.totalPrice).toBe(6500);
        expect(payment.orderitems.length).toBe(2);
        expect(payment.orderitems[0].price).toBe(2000);
        expect(payment.orderitems[0].count).toBe(2);
        expect(payment.orderitems[1].price).toBe(2500);
        expect(payment.orderitems[1].count).toBe(1);

        const response3 = await app.inject({
            method: 'GET',
            url: `/api/payment/${testStoreId}`
        });
        expect(response3.statusCode).toBe(200);
        const payments = JSON.parse(response3.body);
        expect(payments.find((pm: any) => pm.id === payment.id)).not.toBeUndefined();
        expect(payments.find((pm: any) => pm.id === payment.id).orderitems.length).toBe(2);

        await app.close();
    });
});
