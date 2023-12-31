import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Stock from '@DTO/stock.dto';
import * as Menu from '@DTO/menu.dto';
import * as Order from '@DTO/order.dto';
import * as Preorder from '@DTO/preOrder.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('check stock after update', async () => {
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

        expect(coffeeBean.status).toBe('ENOUGH');
        expect(coffeeBean.usingMenuCount).toBe(2);

        expect(milk.status).toBe('EMPTY');
        expect(milk.usingMenuCount).toBe(2);

        expect(lemon.status).toBe('ENOUGH');
        expect(lemon.name).toBe('레몬즙');
        expect(lemon.usingMenuCount).toBe(1);
    });

    test('check stock detail after update', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/${testValues.lemonId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getStockInterface['Reply']['200'];
        expect(body.name).toBe('레몬즙');
        expect(body.price).toBe('5000');
        expect(body.amount).toBe(1000);
        expect(body.unit).toBe('ml');
        expect(body.noticeThreshold).toBe(500);
        expect(body.currentAmount).toBe(1000);
        expect(body.history).toEqual([
            {
                date: expect.any(String),
                amount: 1000,
                price: "5000",
            }
        ]);
    });

    test('check stock detail after update', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/${testValues.grapefruitId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getStockInterface['Reply']['200'];
        expect(body.name).toBe('자몽');
        expect(body.price).toBe('30000');
        expect(body.amount).toBe(2800);
        expect(body.unit).toBe('g');
        expect(body.noticeThreshold).toBe(500);
        expect(body.currentAmount).toBe(1000);
        expect(body.history).toEqual([
            {
                date: expect.any(String),
                amount: 2800,
                price: "26900",
            },
            {
                date: expect.any(String),
                amount: 2800,
                price: "30000",
            }
        ]);
    });

    test('check mixed stock after update', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/mixed`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getMixedStockListInterface['Reply']['200'];
        const [preservedGrapefruit, preservedLemon] = body.mixedStocks;
        expect(preservedGrapefruit.id).toBe(testValues.preservedGrapefruitId);
        expect(preservedLemon.id).toBe(testValues.preservedLemonId);

        expect(preservedLemon.name).toBe('레몬시럽');
    });

    test('check menu after update', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuListInterface['Reply']['200'];
        expect(body.categories[1].category).toBe('티&에이드');

        const americano = body.categories[0].menus[0];
        const latte = body.categories[0].menus[1];
        const grapefruitAde = body.categories[1].menus[0];
        const lemonAde = body.categories[1].menus[1];

        expect(americano.stockStatus).toBe('ENOUGH');
        expect(latte.stockStatus).toBe('EMPTY');
        expect(lemonAde.stockStatus).toBe('EMPTY');
        expect(grapefruitAde.stockStatus).toBe('ENOUGH');
    });

    test('check option after update', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/option`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getOptionListInterface['Reply']['200'];
        expect(body.option[2].options[1].id).not.toBe(testValues.shotMinusOptionId);
        expect(body.option[2].options[1].name).toBe('샷 제외');
        expect(body.option[2].options[1].price).toBe("0");
    });

    test('check menu detail after update', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.americanoId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body.name).toBe('아메리카노(예시)');
        expect(body.price).toBe("2500");
        expect(body.categoryId).toBe(testValues.coffeeCategoryId);
        expect(body.option[2].options[1].id).not.toBe(testValues.shotMinusOptionId);
        expect(body.option[2].options[1].name).toBe('샷 제외');
    });

    test('check order2 after update', async () => {
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

    test('check preorder list after update', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/preorder?date=${new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString()}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Preorder.getPreOrderListInterface['Reply']['200'];
        expect(body.preOrders).toHaveLength(1);
        const [preorder] = body.preOrders;
        expect(preorder.preOrderId).toBe(testValues.secondPreorderId);
        expect(preorder.totalPrice).toBe((6000 * 5 + 4500 * 5).toString());
        expect(preorder.phone).toBe('01011112223');
        expect(preorder.totalCount).toBe(10);
    });

    test('check preorder2 after update', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/preorder/${testValues.secondPreorderId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Preorder.getPreOrderInterface['Reply']['200'];
        expect(body.totalPrice).toBe((6000 * 5 + 4500 * 5).toString());
        const [grapefruitAde, lemonAde] = body.orderitems;
        expect(grapefruitAde.count).toBe(5);
        expect(lemonAde.count).toBe(5);
        expect(lemonAde.menuName).toBe('레몬에이드');
        expect(lemonAde.price).toBe('4500');
    });
};
