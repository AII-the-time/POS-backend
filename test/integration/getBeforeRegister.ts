import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import * as Menu from '@DTO/menu.dto';
import * as Stock from '@DTO/stock.dto';
import * as Order from '@DTO/order.dto';
import { LoginToken } from '@utils/jwt';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    const accessToken = new LoginToken(1).signAccessToken();
    test('get stock list', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/stock`,
          headers: {
            authorization: `Bearer ${accessToken}`,
            storeid: '1',
          },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getStockListInterface['Reply']['200'];
        expect(body.stocks).toEqual(
            [
                {
                    id: 1,
                    name: '물',
                    status: 'UNKNOWN',
                    usingMenuCount: 1,
                },
                {
                    id: 2,
                    name: '원두(예시)',
                    status: 'ENOUGH',
                    usingMenuCount: 2,
                },
                {
                    id: 3,
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
            url: `/api/stock/1`,
            headers: {
                authorization: `Bearer ${accessToken}`,
                storeid: '1',
            },
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
            }
        );
    });

    test('get mixed stock list', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/stock/mixed`,
          headers: {
            authorization: `Bearer ${accessToken}`,
            storeid: '1',
          },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getMixedStockListInterface['Reply']['200'];
        expect(body.mixedStocks).toEqual([]);
    });

    test('get menu list', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/menu`,
          headers: {
            authorization: `Bearer ${accessToken}`,
            storeid: '1',
          },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuListInterface['Reply']['200'];
        expect(body.categories).toEqual([{
            categoryId: 1,
            category: '커피',
            menus: [
                {
                    id: 1,
                    name: '아메리카노(예시)',
                    price: "2500",
                    stockStatus: 'ENOUGH',
                },
                {
                    id: 2,
                    name: '카페라떼(예시)',
                    price: "3000",
                    stockStatus: 'CAUTION',
                }
            ]
        }]);
    });

    test('get menu detail', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/1`,
            headers: {
                authorization: `Bearer ${accessToken}`,
                storeid: '1',
            },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body).toEqual(
            {
                name: '아메리카노(예시)',
                price: "2500",
                category: '커피',
                categoryId: 1,
                option:[
                    {
                        optionType: "온도",
                        options: [
                            {
                                id: 1,
                                name: 'ice',
                                price: "0",
                                isSelectable: true,
                            },
                            {
                                id: 2,
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
                                id: 3,
                                name: '케냐',
                                price: "0",
                                isSelectable: true,
                            },
                            {
                                id: 4,
                                name: '콜롬비아',
                                price: "300",
                                isSelectable: true,
                            }
                        ]
                    },
                    {
                        optionType: "샷",
                        options: [
                            {
                                id: 5,
                                name: '1샷 추가',
                                price: "500",
                                isSelectable: true,
                            },
                            {
                                id: 6,
                                name: '연하게',
                                price: "0",
                                isSelectable: true,
                            }
                        ]
                    }
                ],
                recipe: [
                    {
                      id: 1,
                      name: '물',
                      coldRegularAmount: 150,
                      coldSizeUpAmount: null,
                      hotRegularAmount: null,
                      hotSizeUpAmount: null,
                      isMixed: false,
                      unit: 'ml',
                    },
                    {
                      id: 2,
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



}
