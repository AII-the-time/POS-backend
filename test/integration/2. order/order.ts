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
                        count: 68,
                        options: [1],
                    },
                    {
                        id: testValues.grapefruitAdeId,
                        count: 1,
                        options: [1],
                    }
                ],
                totalPrice: (2500 * 68 + 6000).toString(),
            },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.newOrderInterface['Reply']['200'];
        expect(body.orderId).toBeDefined();
        testValues.setValues('firstOrderId', body.orderId);
    });

    test('get order detail: before pay', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/order/${testValues.firstOrderId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.getOrderInterface['Reply']['200'];
        expect(body.paymentStatus).toBe('WAITING');
        expect(body.pay).toBeUndefined();
        expect(body.mileage).toBeUndefined();
        expect(body.isPreOrdered).toBe(false);
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
                saveMileage: Math.floor((2500 * 68 + 6000)*0.05).toString(),
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
                saveMileage: Math.floor((2500 * 68 + 6000)*0.05).toString(),
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
                saveMileage: Math.floor((2500 * 68 + 6000)*0.05).toString(),
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
                saveMileage: Math.floor((2500 * 68 + 6000)*0.05).toString(),
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
                saveMileage: Math.floor((2500 * 68 + 6000)*0.05).toString(),
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
                saveMileage: Math.floor((2500 * 68 + 6000)*0.05).toString(),
            },
        });
        expect(response.statusCode).toBe(403);
    });

    test('order from preOrder', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order`,
            headers: testValues.storeHeader,
            payload: {
                preOrderId: testValues.firstPreorderId,
                totalPrice: (2500 * 4 + 6000 * 4).toString(),
                menus: [
                    {
                        id: testValues.latteId,
                        count: 4,
                        options: [1],
                    },
                    {
                        id: testValues.lemonAdeId,
                        count: 4,
                        options: [1],
                    },
                ],
            },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.newOrderInterface['Reply']['200'];
        expect(body.orderId).toBeDefined();
        testValues.setValues('secondOrderId', body.orderId);
    });

    test('get order list:before pay', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/order`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.getOrderListInterface['Reply']['200'];
        expect(body.orders.length).toBe(2);
        expect(body.orders[0].orderId).toBe(testValues.secondOrderId);
        expect(body.orders[0].paymentMethod).toBeUndefined();
        expect(body.orders[1].orderId).toBe(testValues.firstOrderId);
    });

    test('pay second order: success', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order/pay`,
            headers: testValues.storeHeader,
            payload: {
                orderId: testValues.secondOrderId,
                paymentMethod: 'CARD',
                mileageId: testValues.mileageId2,
                useMileage: "0",
                saveMileage: Math.floor(2500*4*0.05 + 6000*4*0.05).toString(),
            },
        });
        expect(response.statusCode).toBe(200);
    });

    test('get order list', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/order`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.getOrderListInterface['Reply']['200'];
        expect(body.orders.length).toBe(2);
        expect(body.orders[0].orderId).toBe(testValues.secondOrderId);
        expect(body.orders[1].orderId).toBe(testValues.firstOrderId);
    });

    test('get order list: with date', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/order?date=${new Date().toISOString()}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.getOrderListInterface['Reply']['200'];
        expect(body.orders.length).toBe(2);
        expect(body.orders[0].orderId).toBe(testValues.secondOrderId);
        expect(body.orders[1].orderId).toBe(testValues.firstOrderId);
    });

    test('get order detail:fail because of unknown orderId', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/order/999999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('get order detail', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/order/${testValues.secondOrderId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.getOrderInterface['Reply']['200'];
        expect(body.pay!.paymentMethod).toBe('CARD');
        expect(body.mileage).toBeDefined();
        expect(body.mileage!.use).toBe('0');
        expect(body.mileage!.save).toBe(Math.floor(2500*4*0.05 + 6000*4*0.05).toString());
        expect(body.isPreOrdered).toBe(true);
    });
}
