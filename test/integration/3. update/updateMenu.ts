import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Menu from '@DTO/menu.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
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
        testValues.setValues('lemonAdeId', body.menuId);
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
