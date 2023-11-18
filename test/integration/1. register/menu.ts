import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Stock from '@DTO/stock.dto';
import * as Menu from '@DTO/menu.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('register grapefruit ade:fail non-exist category', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/menu',
            headers: testValues.storeHeader,
            payload: {
                name: '자몽에이드',
                price: 6000,
                categoryId: testValues.adeCategoryId,
                option: [1,3,4],
                recipe: [
                    {
                      id: testValues.preservedGrapefruitId,
                      isMixed: true,
                      unit: 'g',
                      coldRegularAmount: 50,
                    },
                    {
                      id: testValues.sparklingWaterId,
                      isMixed: false,
                      unit: 'ml',
                      coldRegularAmount: 150,
                    },
                ],
            },
        });
        expect(res.statusCode).toEqual(400);
    });

    test('register category:ade', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/menu/category',
            headers: testValues.storeHeader,
            payload: {
                name: '에이드',
            },
        });
        const data = JSON.parse(res.body) as Menu.createCategoryInterface['Reply']['201'];
        expect(res.statusCode).toEqual(201);
        expect(data).toHaveProperty('categoryId');
        testValues.setValues('adeCategoryId', data.categoryId);
    });

    test('register grapefruit ade:fail non-exist stock', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/menu',
            headers: testValues.storeHeader,
            payload: {
                name: '자몽에이드',
                price: 6000,
                categoryId: testValues.adeCategoryId,
                option: [1,3,4],
                recipe: [
                    {
                      id: testValues.preservedGrapefruitId,
                      isMixed: true,
                      unit: 'g',
                      coldRegularAmount: 50,
                    },
                    {
                      id: 999999,
                      isMixed: false,
                      unit: 'ml',
                      coldRegularAmount: 150,
                    },
                ],
            },
        });
        expect(res.statusCode).toEqual(400);
    });

    test('register grapefruit ade', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/menu',
            headers: testValues.storeHeader,
            payload: {
                name: '자몽에이드',
                price: 6000,
                categoryId: testValues.adeCategoryId,
                option: [1,3,4],
                recipe: [
                    {
                      id: testValues.preservedGrapefruitId,
                      isMixed: true,
                      unit: 'g',
                      coldRegularAmount: 50,
                    },
                    {
                      id: testValues.sparklingWaterId,
                      isMixed: false,
                      unit: 'ml',
                      coldRegularAmount: 150,
                    },
                ],
            },
        });
        const data = JSON.parse(res.body) as Menu.createMenuInterface['Reply']['201'];
        expect(res.statusCode).toEqual(201);
        expect(data).toHaveProperty('menuId');
        testValues.setValues('grapefruitAdeId', data.menuId);
    });

    test('register lemon ade', async () => {
        const res = await app.inject({
            method: 'POST',
            url: '/api/menu',
            headers: testValues.storeHeader,
            payload: {
                name: '레몬에이드',
                price: 6000,
                categoryId: testValues.adeCategoryId,
                option: [1,3,4],
                recipe: [
                    {
                      id: testValues.preservedLemonId,
                      isMixed: true,
                      unit: 'g',
                      coldRegularAmount: 50,
                    },
                    {
                      id: testValues.sparklingWaterId,
                      isMixed: false,
                      unit: 'ml',
                      coldRegularAmount: 150,
                    },
                ],
            },
        });
        const data = JSON.parse(res.body) as Menu.createMenuInterface['Reply']['201'];
        expect(res.statusCode).toEqual(201);
        expect(data).toHaveProperty('menuId');
        testValues.setValues('lemonAdeId', data.menuId);
    });

    test('stock list after register', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/stock',
            headers: testValues.storeHeader,
        });
        const data = JSON.parse(res.body) as Stock.getStockListInterface['Reply']['200'];
        expect(res.statusCode).toEqual(200);
        expect(data).toHaveProperty('stocks');
        expect(data.stocks).toHaveLength(7);

        const grapefruitStock = data.stocks.find((stock) => stock.name === '자몽');
        expect(grapefruitStock).toBeDefined();
        expect(grapefruitStock!.usingMenuCount).toEqual(1);
    });
}
