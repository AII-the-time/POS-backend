import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('register grapefruit', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/stock',
            headers: testValues.storeHeader,
            payload: {
                name: 'grapefruit',
            },
        });
        const data = JSON.parse(res.body);
        console.log(data);
        expect(res.statusCode).toEqual(201);
        expect(data).toHaveProperty('stockId');
        testValues.setValues('grapefruitId', data.stockId);
    });

}
