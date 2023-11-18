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

    test('get stock detail:lemon', async () => {
        //레몬의 유닛이 업데이트 되었는지 확인
        const res = await app.inject({
            method: 'GET',
            url: `/api/stock/${testValues.lemonId}`,
            headers: testValues.storeHeader,
        });
        const data = JSON.parse(res.body) as Stock.getStockInterface['Reply']['200'];
        expect(res.statusCode).toEqual(200);
        expect(data).toHaveProperty('name', '레몬');
        expect(data).toHaveProperty('unit', 'g');
    });

    test('search mixed stock', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/stock/withMixed/search?name=자몽',
            headers: testValues.storeHeader,
        });
        const data = JSON.parse(res.body) as Stock.getStockListInterface['Reply']['200'];
        expect(res.statusCode).toEqual(200);
        expect(data).toHaveProperty('stocks');
        expect(data.stocks).toHaveLength(2);
        expect(data.stocks[0]).toHaveProperty('name', '자몽');
        expect(data.stocks[1]).toHaveProperty('name', '자몽청');
    });

    test('get mixed stock detail:preservedGrapefruit', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/stock/mixed/${testValues.preservedGrapefruitId}`,
            headers: testValues.storeHeader,
        });
        const data = JSON.parse(res.body) as Stock.getMixedStockInterface['Reply']['200'];
        expect(res.statusCode).toEqual(200);
        expect(data).toHaveProperty('name', '자몽청');
    });
}
