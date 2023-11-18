import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Order from '@DTO/order.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('order americano unitl stock becomes OUT_OF_STOCK', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order`,
            headers: testValues.storeHeader,
            payload: {
                menus: [
                    {
                        id: testValues.americanoId,
                        count: 70,
                        options: [1],
                    },
                ],
                totalPrice: (2500 * 70).toString(),
            },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.newOrderInterface['Reply']['200'];
        expect(body.orderId).toBeDefined();
        testValues.setValues('firstOrderId', body.orderId);
    });

    test('pay first order: fail because of Not enough mileage', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order/pay`,
            headers: testValues.storeHeader,
            payload: {
                orderId: testValues.firstOrderId,
                paymentMethod: 'CARD',
                mileageId: testValues.mileageId1,
                useMileage: (2000).toString(),
                saveMileage: Math.floor(2500*70*0.05).toString(),
            },
        });
        expect(response.statusCode).toBe(403);
    });

    test('pay first order: fail because of unknown mileage', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order/pay`,
            headers: testValues.storeHeader,
            payload: {
                orderId: testValues.firstOrderId,
                paymentMethod: 'CARD',
                mileageId: 999999,
                useMileage: (1000).toString(),
                saveMileage: Math.floor(2500*70*0.05).toString(),
            },
        });
        expect(response.statusCode).toBe(404);
    });

    test('pay first order: fail because of unknown orderId', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order/pay`,
            headers: testValues.storeHeader,
            payload: {
                orderId: 999999,
                paymentMethod: 'CARD',
                mileageId: testValues.mileageId1,
                useMileage: (1000).toString(),
                saveMileage: Math.floor(2500*70*0.05).toString(),
            },
        });
        expect(response.statusCode).toBe(404);
    });

    test('pay first order: fail because of ommited mileageInfo', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order/pay`,
            headers: testValues.storeHeader,
            payload: {
                orderId: testValues.firstOrderId,
                paymentMethod: 'CARD',
                mileageId: testValues.mileageId1,
                saveMileage: Math.floor(2500*70*0.05).toString(),
            },
        });
        expect(response.statusCode).toBe(400);
    });

    test('pay first order: success', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order/pay`,
            headers: testValues.storeHeader,
            payload: {
                orderId: testValues.firstOrderId,
                paymentMethod: 'CARD',
                mileageId: testValues.mileageId1,
                useMileage: (1000).toString(),
                saveMileage: Math.floor(2500*70*0.05).toString(),
            },
        });
        expect(response.statusCode).toBe(200);
    });

    test('pay first order: fail because of already paid', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order/pay`,
            headers: testValues.storeHeader,
            payload: {
                orderId: testValues.firstOrderId,
                paymentMethod: 'CARD',
                mileageId: testValues.mileageId1,
                useMileage: (1000).toString(),
                saveMileage: Math.floor(2500*70*0.05).toString(),
            },
        });
        expect(response.statusCode).toBe(403);
    });

}
