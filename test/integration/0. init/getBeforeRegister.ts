import { FastifyInstance } from 'fastify';
import testValues from '../testValues';
import * as Menu from '@DTO/menu.dto';
import * as Stock from '@DTO/stock.dto';
import * as Order from '@DTO/order.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('get stock list', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getStockListInterface['Reply']['200'];
        expect(body.stocks).toEqual(
            [
                {
                    id: testValues.waterId,
                    name: '물',
                    status: 'ENOUGH',
                    usingMenuCount: 1,
                },
                {
                    id: testValues.coffeeBeanId,
                    name: '원두(예시)',
                    status: 'ENOUGH',
                    usingMenuCount: 2,
                },
                {
                    id: testValues.milkId,
                    name: '우유(예시)',
                    status: 'CAUTION',
                    usingMenuCount: 1,
                }
            ]
        );
    });

    test('get stock detail', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/${testValues.waterId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getStockInterface['Reply']['200'];
        expect(body).toEqual(
            {
                name: '물',
                amount: null,
                unit: 'ml',
                price: null,
                currentAmount: null,
                noticeThreshold: -1,
                updatedAt: expect.any(String),
                history: []
            }
        );
    });

    test('get stock detail: fail', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/9999999999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('get mixed stock list', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/mixed`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getMixedStockListInterface['Reply']['200'];
        expect(body.mixedStocks).toEqual([]);
    });

    test('get mixed stock detail: fail', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/mixed/9999999999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('get menu list', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuListInterface['Reply']['200'];
        expect(body.categories).toEqual([{
            categoryId: 1,
            category: '커피',
            menus: [
                {
                    id: testValues.americanoId,
                    name: '아메리카노(예시)',
                    price: "2500",
                    stockStatus: 'ENOUGH',
                },
                {
                    id: testValues.latteId,
                    name: '카페라떼(예시)',
                    price: "3000",
                    stockStatus: 'CAUTION',
                }
            ]
        }]);
    });

    test('get menu detail: fail', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/9999999999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('get menu detail', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.americanoId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body).toEqual(
            {
                name: '아메리카노(예시)',
                price: "2500",
                category: '커피',
                categoryId: testValues.coffeeCategoryId,
                history: [],
                option: [
                    {
                        optionType: "온도",
                        options: [
                            {
                                id: testValues.iceOptionId,
                                name: 'ice',
                                price: "0",
                                isSelectable: true,
                            },
                            {
                                id: testValues.hotOptionId,
                                name: 'hot',
                                price: "0",
                                isSelectable: true,
                            }
                        ]
                    },
                    {
                        optionType: "원두",
                        options: [
                            {
                                id: testValues.bean1OptionId,
                                name: '원두1',
                                price: "0",
                                isSelectable: true,
                            },
                            {
                                id: testValues.bean2OptionId,
                                name: '원두2',
                                price: "300",
                                isSelectable: true,
                            }
                        ]
                    },
                    {
                        optionType: "샷",
                        options: [
                            {
                                id: testValues.shotPlusOptionId,
                                name: '1샷 추가',
                                price: "500",
                                isSelectable: true,
                            },
                            {
                                id: testValues.shotMinusOptionId,
                                name: '샷 빼기',
                                price: "0",
                                isSelectable: true,
                            }
                        ]
                    }
                ],
                recipe: [
                    {
                        id: testValues.waterId,
                        name: '물',
                        coldRegularAmount: 150,
                        coldSizeUpAmount: null,
                        hotRegularAmount: null,
                        hotSizeUpAmount: null,
                        isMixed: false,
                        unit: 'ml',
                    },
                    {
                        id: testValues.coffeeBeanId,
                        name: '원두(예시)',
                        coldRegularAmount: 25,
                        coldSizeUpAmount: null,
                        hotRegularAmount: null,
                        hotSizeUpAmount: null,
                        isMixed: false,
                        unit: 'g',
                    },
                ],
            }
        );
    });

    test('default options', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/option`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getOptionListInterface['Reply']['200'];
        expect(body.option).toEqual([
            {
                optionType: '온도',
                options: [
                    {
                        id: expect.any(Number),
                        name: 'ice',
                        price: '0',
                    },
                    {
                        id: expect.any(Number),
                        name: 'hot',
                        price: '0',
                    },
                ],
            },
            {
                optionType: '원두',
                options: [
                    {
                        id: expect.any(Number),
                        name: '원두1',
                        price: '0',
                    },
                    {
                        id: expect.any(Number),
                        name: '원두2',
                        price: '300',
                    },
                ],
            },
            {
                optionType: '샷',
                options: [
                    {
                        id: expect.any(Number),
                        name: '1샷 추가',
                        price: '500',
                    },
                    {
                        id: expect.any(Number),
                        name: '샷 빼기',
                        price: '0',
                    },
                ],
            },
        ]);
    });


}
