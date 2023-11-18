import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Preorder from '@DTO/preOrder.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('update second preorder', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/preorder`,
            headers: testValues.storeHeader,
            payload: {
                id: testValues.secondPreorderId,
                menus: [
                    {
                        id: testValues.grapefruitAdeId,
                        count: 5,
                        options: [1],
                    },
                    {
                        id: testValues.lemonAdeId,
                        count: 5,
                        options: [1],
                    }
                ],
                totalPrice: (6000 * 5 + 4500 * 5).toString(),
                phone: '01011112223',
                memo: '매장에서 먹을게요',
                orderedFor: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
            },
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Preorder.updatePreOrderInterface['Reply']['201'];
        expect(body.preOrderId).not.toBe(testValues.secondPreorderId);
        testValues.setValues('secondPreorderId', body.preOrderId);
    });
}
