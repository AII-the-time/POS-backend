import server from '../../src';
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
        const menu = JSON.parse(response.body).menus[0];
        expect(menu.storeId).toBe(testStoreId);

        const menu2 = JSON.parse(response.body).menus[1];

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
        expect(payment.orderitems.length).toBe(2);
        expect(payment.orderitems[0].count).toBe(2);
        expect(payment.orderitems[1].count).toBe(1);

        const response3 = await app.inject({
            method: 'GET',
            url: `/api/payment/${testStoreId}`
        });
        expect(response3.statusCode).toBe(200);
        const payments = JSON.parse(response3.body);
        expect(payments.find((pm: any) => pm.id === payment.id)).not.toBeUndefined();
        expect(payments.find((pm: any) => pm.id === payment.id).orderitems.length).toBe(2);
        
        console.log("menu done");
    });
});
