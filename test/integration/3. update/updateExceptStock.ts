import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Stock from '@DTO/stock.dto';
import * as Menu from '@DTO/menu.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('update coffee bean stock', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/stock`,
            headers: testValues.storeHeader,
            payload: {
                id: testValues.coffeeBeanId,
                name: '케냐원두',
                amount: 500,
                price: "11900",
                noticeThreshold: 1000,
                unit: 'g',
                currentAmount: 2000,
            } as Stock.updateStockInterface['Body']
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Stock.updateStockInterface['Reply']['201'];
        expect(body.stockId).toBe(testValues.coffeeBeanId);
    });

    test('update lemon stock', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/stock`,
            headers: testValues.storeHeader,
            payload: {
                id: testValues.lemonId,
                name: '레몬즙',
                amount: 1000,
                price: "5000",
                noticeThreshold: 500,
                unit: null,
                currentAmount: 1000,
            } as Stock.updateStockInterface['Body']
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Stock.updateStockInterface['Reply']['201'];
        expect(body.stockId).toBe(testValues.lemonId);
    });

    test('update sparkling water stock', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/stock`,
            headers: testValues.storeHeader,
            payload: {
                id: testValues.sparklingWaterId,
                name: '탄산수',
                amount: 100,
                price: "171",
                noticeThreshold: 500,
                unit: null,
                currentAmount: 1000,
            } as Stock.updateStockInterface['Body']
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Stock.updateStockInterface['Reply']['201'];
        expect(body.stockId).toBe(testValues.sparklingWaterId);
    });

    test('update preserved lemon mixed stock', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/stock/mixed`,
            headers: testValues.storeHeader,
            payload: {
                id: testValues.preservedLemonId,
                name: '레몬시럽',
                totalAmount: 2000,
                unit: null,
                mixing: [
                    {
                        id: testValues.lemonId,
                        unit: 'ml',
                        amount: 500,
                    },
                    {
                        id: testValues.sugarId,
                        unit: 'g',
                        amount: 1000,
                    },
                    {
                        id: testValues.waterId,
                        unit: 'ml',
                        amount: 500,
                    }
                ]
            } as Stock.updateMixedStockInterface['Body']
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Stock.updateMixedStockInterface['Reply']['201'];
        expect(body.mixedStockId).toBe(testValues.preservedLemonId);
    });

    test('update lemonade menu', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/menu`,
            headers: testValues.storeHeader,
            payload: {
                id: testValues.lemonAdeId,
                name: '레몬에이드',
                price: "4500",
                categoryId: testValues.adeCategoryId,
                option: [1,5],
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
            }
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Menu.updateMenuInterface['Reply']['201'];
        expect(body.menuId).not.toBe(testValues.lemonAdeId);
    });

    test('update ade category', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/menu/category`,
            headers: testValues.storeHeader,
            payload: {
                id: testValues.adeCategoryId,
                name: '티&에이드',
            }
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Menu.updateCategoryInterface['Reply']['201'];
        expect(body.categoryId).toBe(testValues.adeCategoryId);
    });

    test('update option', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/menu/option`,
            headers: testValues.storeHeader,
            payload: {
                optionId: testValues.shotMinusOptionId,
                optionName: '샷 제외',
                optionPrice: "0",
                optionCategory: "샷"
            }
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Menu.updateOptionInterface['Reply']['201'];
        expect(body.optionId).not.toBe(testValues.shotMinusOptionId);
    });
}
