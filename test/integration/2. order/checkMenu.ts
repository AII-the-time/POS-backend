import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Menu from '@DTO/menu.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('menu list', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuListInterface['Reply']['200'];
        const americano = body.categories[0].menus[0];
        const latte = body.categories[0].menus[1];
        const grapefruitAde = body.categories[1].menus[0];
        const lemonAde = body.categories[1].menus[1];
        expect(americano.id).toBe(testValues.americanoId);
        expect(americano.stockStatus).toBe('OUT_OF_STOCK');
        expect(latte.id).toBe(testValues.latteId);
        expect(latte.stockStatus).toBe('EMPTY');
        expect(grapefruitAde.id).toBe(testValues.grapefruitAdeId);
        expect(grapefruitAde.stockStatus).toBe('UNKNOWN');
        expect(lemonAde.id).toBe(testValues.lemonAdeId);
        expect(lemonAde.stockStatus).toBe('UNKNOWN');
    });

    test('menu detail', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.lemonAdeId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body.name).toBe('레몬에이드');
        expect(body.price).toBe("6000");
        expect(body.categoryId).toBe(testValues.adeCategoryId);
        expect(body.recipe).toHaveLength(2);
        expect(body.recipe[0].id).toBe(testValues.preservedLemonId);
        expect(body.recipe[1].id).toBe(testValues.sparklingWaterId);
    });
}
