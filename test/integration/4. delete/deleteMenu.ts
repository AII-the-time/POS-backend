import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Stock from '@DTO/stock.dto';
import * as Menu from '@DTO/menu.dto';
import * as Order from '@DTO/order.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('delete menu:fail', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/menu/99999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('delete menu:lemon ade', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/menu/${testValues.lemonAdeId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(204);
    });

    test('check stock after delete menu', async () => {
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

        expect(water.status).toBe('ENOUGH');
        expect(water.usingMenuCount).toBe(1);

        expect(coffeeBean.status).toBe('ENOUGH');
        expect(coffeeBean.usingMenuCount).toBe(2);

        expect(grapefruit.status).toBe('ENOUGH');
        expect(grapefruit.usingMenuCount).toBe(0);

        expect(lemon.status).toBe('ENOUGH');
        expect(lemon.name).toBe('레몬즙');
        expect(lemon.usingMenuCount).toBe(0);

        expect(sparklingWater.status).toBe('ENOUGH');
        expect(sparklingWater.usingMenuCount).toBe(1);

        expect(sugar.status).toBe('ENOUGH');
        expect(sugar.usingMenuCount).toBe(0);
    });

    test('check menu list after delete menu', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuListInterface['Reply']['200'];
        expect(body.categories).toHaveLength(2);
        expect(body.categories[1].menus).toHaveLength(1);
    });

    test('check order2 after delete menu', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/order/${testValues.secondOrderId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.getOrderInterface['Reply']['200'];
        const [latte, lemonAde] = body.orderitems;
        expect(body.totalPrice).toBe((2500 * 4 + 6000 * 4).toString());
        expect(lemonAde.options).toEqual([{name: 'ice', price: '0'}]);
        expect(lemonAde.count).toBe(4);
        expect(lemonAde.menuName).toBe('레몬에이드');
        expect(lemonAde.price).toBe('6000');
    });

    test('delete category:fail', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/menu/category/99999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('delete category:ade', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/menu/category/${testValues.adeCategoryId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(204);
    });

    test('delete option:fail', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/menu/option/99999`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(404);
    });

    test('delete option:bean2', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/api/menu/option/${testValues.bean2OptionId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(204);
    });

    test('check menu list after delete category', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuListInterface['Reply']['200'];
        expect(body.categories).toHaveLength(1);
    });

    test('check stock after delete menu', async () => {
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

        expect(water.status).toBe('ENOUGH');
        expect(water.usingMenuCount).toBe(1);

        expect(coffeeBean.status).toBe('ENOUGH');
        expect(coffeeBean.usingMenuCount).toBe(2);

        expect(grapefruit.status).toBe('ENOUGH');
        expect(grapefruit.usingMenuCount).toBe(0);

        expect(lemon.status).toBe('ENOUGH');
        expect(lemon.name).toBe('레몬즙');
        expect(lemon.usingMenuCount).toBe(0);

        expect(sparklingWater.status).toBe('ENOUGH');
        expect(sparklingWater.usingMenuCount).toBe(0);

        expect(sugar.status).toBe('ENOUGH');
        expect(sugar.usingMenuCount).toBe(0);
    });

    test('check option after delete option', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/option`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getOptionListInterface['Reply']['200'];
        expect(body.option).toHaveLength(3);
        expect(body.option[0].options).toHaveLength(2);
        expect(body.option[1].options).toHaveLength(1);
        expect(body.option[2].options).toHaveLength(2);
    });

    test('check menu detail after delete option', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.americanoId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body.name).toBe('아메리카노(예시)');
        expect(body.option[1].options).toHaveLength(1);
        expect(body.option[1].options[0].name).toBe('원두1');
    });
};
