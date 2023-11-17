import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Stock from '@DTO/stock.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('register preservedGrapefruit', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/stock/mixed',
            headers: testValues.storeHeader,
            payload: {
                name: '자몽청',
                totalAmount: 2000,
                unit: 'g',
                mixing: [
                    {
                        id: testValues.grapefruitId,
                        unit: 'g',
                        amount: 1000,
                    },
                    {
                        id: testValues.sugarId,
                        unit: 'g',
                        amount: 1000,
                    }
                ]
            },
        });
        const data = JSON.parse(res.body) as Stock.createMixedStockInterface['Reply']['201'];
        expect(res.statusCode).toEqual(201);
        expect(data).toHaveProperty('mixedStockId');
        testValues.setValues('preservedGrapefruitId', data.mixedStockId);
    });

    test('register preservedLemon', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/stock/mixed',
            headers: testValues.storeHeader,
            payload: {
                name: '레몬청',
                totalAmount: 2000,
                unit: 'g',
                mixing: [
                    {
                        id: testValues.lemonId,
                        unit: 'g',
                        amount: 1000,
                    },
                    {
                        id: testValues.sugarId,
                        unit: 'g',
                        amount: 1000,
                    }
                ]
            },
        });
        const data = JSON.parse(res.body) as Stock.createMixedStockInterface['Reply']['201'];
        expect(res.statusCode).toEqual(201);
        expect(data).toHaveProperty('mixedStockId');
        testValues.setValues('preservedLemonId', data.mixedStockId);
    });

    test('get mixed stock list', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/mixed`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getMixedStockListInterface['Reply']['200'];
        expect(body.mixedStocks).toHaveLength(2);
    });
}
