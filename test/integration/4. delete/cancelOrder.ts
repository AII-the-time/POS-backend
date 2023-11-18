import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Stock from '@DTO/stock.dto';
import * as Menu from '@DTO/menu.dto';
import * as Order from '@DTO/order.dto';
import * as Preorder from '@DTO/preOrder.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('cancel order: fail', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/order/99999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('cancel order: first order', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/order/${testValues.firstOrderId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(204);
    });

    test('check order after cancel', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/order`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.getOrderListInterface['Reply']['200'];
        expect(body.orders).toHaveLength(2);
        const [secondOrder, firstOrder] = body.orders;
        expect(firstOrder.orderId).toBe(testValues.firstOrderId);
        expect(firstOrder.paymentStatus).toBe('CANCELED');
        expect(firstOrder.isPreOrdered).toBe(false);
        expect(secondOrder.orderId).toBe(testValues.secondOrderId);
        expect(secondOrder.paymentStatus).toBe('PAID');
        expect(secondOrder.isPreOrdered).toBe(true);
    });

    test('cancel pre order: fail', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/preorder/99999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('check pre order before cancel', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/preorder?date=${new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Preorder.getPreOrderListInterface['Reply']['200'];
        expect(body.preOrders.length).toBe(1);
    });

    test('cancel pre order: second order', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/preorder/${testValues.secondPreorderId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(204);
    });

    test('check pre order after cancel', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/preorder?date=${new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Preorder.getPreOrderListInterface['Reply']['200'];
        expect(body.preOrders.length).toBe(0);
    });
};
