import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Preorder from '@DTO/preOrder.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('preorder cafe latte and lemon ade', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/preorder`,
            headers: testValues.storeHeader,
            payload: {
                menus: [
                    {
                        id: testValues.latteId,
                        count: 3,
                        options: [1],
                    },
                    {
                        id: testValues.lemonAdeId,
                        count: 4,
                        options: [1],
                    },
                ],
                totalPrice: (2500 * 3 + 6000 * 4).toString(),
                phone: '01011112222',
                memo: '매장에서 먹을게요',
                orderedFor: new Date().toISOString(),
            },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Preorder.newPreOrderInterface['Reply']['200'];
        expect(body.preOrderId).toBeDefined();
        testValues.setValues('firstPreorderId', body.preOrderId);
    });

    test('preorder grapefurit ade', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/preorder`,
            headers: testValues.storeHeader,
            payload: {
                menus: [
                    {
                        id: testValues.grapefruitAdeId,
                        count: 10,
                        options: [1],
                    },
                ],
                totalPrice: (6000 * 10).toString(),
                phone: '01011112223',
                memo: '매장에서 먹을게요',
                orderedFor: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
            },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Preorder.newPreOrderInterface['Reply']['200'];
        expect(body.preOrderId).toBeDefined();
        testValues.setValues('secondPreorderId', body.preOrderId);
    });

    test('get preorder list', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/preorder`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Preorder.getPreOrderListInterface['Reply']['200'];
        expect(body.preOrders.length).toBe(1);
        expect(body.preOrders[0].preOrderId).toBe(testValues.firstPreorderId);
    });

    test('get preorder list with date', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/preorder?date=${new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Preorder.getPreOrderListInterface['Reply']['200'];
        expect(body.preOrders.length).toBe(1);
        expect(body.preOrders[0].preOrderId).toBe(testValues.secondPreorderId);
    });

    test('get preorder detail: fail because of unknown preorderId', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/preorder/999999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('get preorder detail', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/preorder/${testValues.firstPreorderId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Preorder.getPreOrderInterface['Reply']['200'];
        expect(body.totalCount).toBe(7);
    });

}
