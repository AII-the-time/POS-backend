import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Stock from '@DTO/stock.dto';
import * as Menu from '@DTO/menu.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('delete stock:fail', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/stock/99999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('delete stock', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/stock/${testValues.milkId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(204);
    });

    test('delete mixed stock:fail', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/stock/mixed/99999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('delete mixed stock', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/stock/mixed/${testValues.preservedGrapefruitId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(204);
    });

    test('check stock after delete', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getStockListInterface['Reply']['200'];
        const [water,coffeeBean, grapefruit, lemon, sparklingWater, sugar] = body.stocks;
        expect(water.id).toBe(testValues.waterId);
        expect(coffeeBean.id).toBe(testValues.coffeeBeanId);
        expect(grapefruit.id).toBe(testValues.grapefruitId);
        expect(lemon.id).toBe(testValues.lemonId);
        expect(sparklingWater.id).toBe(testValues.sparklingWaterId);
        expect(sugar.id).toBe(testValues.sugarId);

        expect(water.status).toBe('UNKNOWN');
        expect(water.usingMenuCount).toBe(1);

        expect(coffeeBean.status).toBe('ENOUGH');
        expect(coffeeBean.usingMenuCount).toBe(2);

        expect(grapefruit.status).toBe('ENOUGH');
        expect(grapefruit.usingMenuCount).toBe(0);

        expect(lemon.status).toBe('ENOUGH');
        expect(lemon.name).toBe('레몬즙');
        expect(lemon.usingMenuCount).toBe(1);

        expect(sparklingWater.status).toBe('ENOUGH');
        expect(sparklingWater.usingMenuCount).toBe(2);

        expect(sugar.status).toBe('ENOUGH');
        expect(sugar.usingMenuCount).toBe(1);
    });

    test('check mixed stock after delete', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/mixed`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getMixedStockListInterface['Reply']['200'];
        expect(body.mixedStocks).toHaveLength(1);
        expect(body.mixedStocks[0].id).toBe(testValues.preservedLemonId);
    });

    test('check mixed stock detail after delete', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/mixed/${testValues.preservedLemonId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getMixedStockInterface['Reply']['200'];
        expect(body.mixing).toHaveLength(2);
        expect(body.mixing[0].id).toBe(testValues.lemonId);
        expect(body.mixing[1].id).toBe(testValues.sugarId);
    });

    test('check menu after delete', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuListInterface['Reply']['200'];
        expect(body.categories[1].category).toBe('티&에이드');
        const latte = body.categories[0].menus[1];
        const grapefruitAde = body.categories[1].menus[0];
        const lemonAde = body.categories[1].menus[1];
        expect(latte.stockStatus).toBe('ENOUGH');
        expect(latte.name).toBe('카페라떼(예시)');
        expect(grapefruitAde.stockStatus).toBe('ENOUGH');
        expect(grapefruitAde.name).toBe('자몽에이드');
        expect(lemonAde.stockStatus).toBe('ENOUGH');
        expect(lemonAde.name).toBe('레몬에이드');
    });

    test('check menu detail after delete', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.latteId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body.recipe).toHaveLength(1);
        expect(body.recipe[0].id).toBe(testValues.coffeeBeanId);

        const response2 = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.lemonAdeId}`,
            headers: testValues.storeHeader,
        });
        expect(response2.statusCode).toBe(200);
        const body2 = JSON.parse(response2.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body2.price).toBe("4500");
        expect(body2.category).toBe('티&에이드');
        expect(body2.recipe).toHaveLength(2);
        expect(body2.recipe[0].id).toBe(testValues.preservedLemonId);
        expect(body2.recipe[1].id).toBe(testValues.sparklingWaterId);
        expect(body2.history).toHaveLength(1);

        const response3 = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.grapefruitAdeId}`,
            headers: testValues.storeHeader,
        });
        expect(response3.statusCode).toBe(200);
        const body3 = JSON.parse(response3.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body3.price).toBe("6000");
        expect(body3.category).toBe('티&에이드');
        expect(body3.recipe).toHaveLength(1);
        expect(body3.recipe[0].id).toBe(testValues.sparklingWaterId);
    });

    test('check search stock after delete', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/search?name=우유`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.searchStockInterface['Reply']['200'];
        expect(body.stocks).toHaveLength(0);
    });
};
