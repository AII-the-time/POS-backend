import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import * as Stock from '@DTO/stock.dto';
import testValues from '../testValues';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('register grapefruit', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/stock',
            headers: testValues.storeHeader,
            payload: {
                name: '자몽',
                unit: 'g',
                currentAmount: 3000,
                noticeThreshold: 500,
                amount: 2800,
                price: "26900",
            },
        });
        const data = JSON.parse(res.body) as Stock.createStockInterface['Reply']['201'];
        expect(res.statusCode).toEqual(201);
        expect(data).toHaveProperty('stockId');
        testValues.setValues('grapefruitId', data.stockId);
    });

    test('register lemon', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/stock',
            headers: testValues.storeHeader,
            payload: {
                name: '레몬',
            },
        });
        const data = JSON.parse(res.body) as Stock.createStockInterface['Reply']['201'];
        expect(res.statusCode).toEqual(201);
        expect(data).toHaveProperty('stockId');
        testValues.setValues('lemonId', data.stockId);
    });

    test('register sparkling water', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/stock',
            headers: testValues.storeHeader,
            payload: {
                name: '탄산수',
            },
        });
        const data = JSON.parse(res.body) as Stock.createStockInterface['Reply']['201'];
        expect(res.statusCode).toEqual(201);
        expect(data).toHaveProperty('stockId');
        testValues.setValues('sparklingWaterId', data.stockId);
    });

    test('register sugar', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/stock',
            headers: testValues.storeHeader,
            payload: {
                name: '설탕',
                unit: 'g',
                currentAmount: 3000,
                noticeThreshold: 500,
                amount: 1000,
                price: "2400",
            },
        });
        const data = JSON.parse(res.body) as Stock.createStockInterface['Reply']['201'];
        expect(res.statusCode).toEqual(201);
        expect(data).toHaveProperty('stockId');
        testValues.setValues('sugarId', data.stockId);
    });

    test('get stock list', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/stock',
            headers: testValues.storeHeader,
        });
        const data = JSON.parse(res.body) as Stock.getStockListInterface['Reply']['200'];
        expect(res.statusCode).toEqual(200);
        expect(data).toHaveProperty('stocks');
        expect(data.stocks).toHaveLength(7);
    });

    test('search stock', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/stock/search?name=자몽',
            headers: testValues.storeHeader,
        });
        const data = JSON.parse(res.body) as Stock.getStockListInterface['Reply']['200'];
        expect(res.statusCode).toEqual(200);
        expect(data).toHaveProperty('stocks');
        expect(data.stocks).toHaveLength(1);
    })

    test('get stock detail:grapefruit', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/stock/${testValues.grapefruitId}`,
            headers: testValues.storeHeader,
        });
        const data = JSON.parse(res.body) as Stock.getStockInterface['Reply']['200'];
        expect(res.statusCode).toEqual(200);
        expect(data).toHaveProperty('name', '자몽');
        expect(data.history).toEqual([
            {
                date: expect.any(String),
                amount: 2800,
                price: "26900",
            }
        ]);
    });

    test('get stock detail:lemon', async () => {
        const res = await app.inject({
            method: 'GET',
            url: `/api/stock/${testValues.lemonId}`,
            headers: testValues.storeHeader,
        });
        const data = JSON.parse(res.body) as Stock.getStockInterface['Reply']['200'];
        expect(res.statusCode).toEqual(200);
        expect(data).toHaveProperty('name', '레몬');
        expect(data).toHaveProperty('unit', null);
    });
}
