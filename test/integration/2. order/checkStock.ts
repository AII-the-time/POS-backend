import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Stock from '@DTO/stock.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('check stock after order', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getStockListInterface['Reply']['200'];
        const [water,coffeeBean, milk, grapefruit, lemon, sparklingWater, sugar] = body.stocks;
        expect(water.id).toBe(testValues.waterId);
        expect(coffeeBean.id).toBe(testValues.coffeeBeanId);
        expect(milk.id).toBe(testValues.milkId);
        expect(grapefruit.id).toBe(testValues.grapefruitId);
        expect(lemon.id).toBe(testValues.lemonId);
        expect(sparklingWater.id).toBe(testValues.sparklingWaterId);
        expect(sugar.id).toBe(testValues.sugarId);

        expect(water.status).toBe('ENOUGH');
        expect(water.usingMenuCount).toBe(1);

        expect(coffeeBean.status).toBe('OUT_OF_STOCK');
        expect(coffeeBean.usingMenuCount).toBe(2);

        expect(milk.status).toBe('EMPTY');
        expect(milk.usingMenuCount).toBe(1);

        expect(grapefruit.status).toBe('ENOUGH');
        expect(grapefruit.usingMenuCount).toBe(1);

        expect(lemon.status).toBe('UNKNOWN');
        expect(lemon.usingMenuCount).toBe(1);

        expect(sparklingWater.status).toBe('UNKNOWN');
        expect(sparklingWater.usingMenuCount).toBe(2);

        expect(sugar.status).toBe('ENOUGH');
        expect(sugar.usingMenuCount).toBe(2);
    });
}
