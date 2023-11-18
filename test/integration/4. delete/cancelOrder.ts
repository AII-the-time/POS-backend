import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Stock from '@DTO/stock.dto';
import * as Menu from '@DTO/menu.dto';
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

    test('cancel pre order: fail', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/preorder/99999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('cancel pre order: second order', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/preorder/${testValues.secondOrderId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(204);
    });
};
