import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Menu from '@DTO/menu.dto';
import * as Order from '@DTO/order.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    let tempOrderId: number;
    test('order without mileage', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order`,
            headers: testValues.storeHeader,
            payload: {
                menus: [
                    {
                        id: testValues.americanoId,
                        count: 1,
                        options: [1],
                    },
                ],
                totalPrice: (2500).toString(),
            },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Order.newOrderInterface['Reply']['200'];
        expect(body.orderId).toBeDefined();
        tempOrderId = body.orderId;
    });

    test('pay without mileage', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/order/pay`,
            headers: testValues.storeHeader,
            payload: {
                orderId: tempOrderId,
                paymentMethod: 'CARD',
            } as Order.payInterface['Body'],
        });
        expect(response.statusCode).toBe(200);
    });

    let tempMenuId: number;
    test('register menu without option, recipe', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/menu`,
            headers: testValues.storeHeader,
            payload: {
                name: 'new menu',
                price: "1000",
                categoryId: testValues.coffeeCategoryId,
            } as Menu.createMenuInterface['Body'],
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Menu.createMenuInterface['Reply']['201'];
        expect(body.menuId).toBeDefined();
        tempMenuId = body.menuId;
    });

    test('update menu without option, recipe', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/menu`,
            headers: testValues.storeHeader,
            payload: {
                id: tempMenuId,
                name: 'new menu',
                price: "1000",
                categoryId: testValues.coffeeCategoryId,
            } as Menu.updateMenuInterface['Body']
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Menu.updateMenuInterface['Reply']['201'];
        expect(body.menuId).not.toBe(tempMenuId);
    });

    test('update menu with recipe with unit', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: `/api/menu`,
            headers: testValues.storeHeader,
            payload: {
                id: tempMenuId,
                name: 'new menu',
                price: "1000",
                categoryId: testValues.coffeeCategoryId,
                recipe: [
                    {
                        id: testValues.coffeeBeanId,
                        unit: 'g',
                        isMixed: false,
                    },
                    {
                        id: testValues.preservedLemonId,
                        unit: 'g',
                        isMixed: true,
                    }
                ],
            } as Menu.updateMenuInterface['Body']
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body) as Menu.updateMenuInterface['Reply']['201'];
        expect(body.menuId).not.toBe(tempMenuId);
    });
};
