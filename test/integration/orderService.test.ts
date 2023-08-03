import server from '../../src/server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { CertificatedPhoneToken } from "../../src/utils/jwt";
import userService from '../../src/services/userService';
import storeService from '../../src/services/storeService';
import menuService from '../../src/services/menuService';
import * as Menu from "../../src/DTO/menu.dto";
import * as Order from "../../src/DTO/order.dto";
import * as Mileage from "../../src/DTO/mileage.dto";

let app: FastifyInstance;

const phone = '010-1234-5678';
const businessRegistrationNumber = '0123456789';
let accessToken: string;
let storeId: number;
let menus: Menu.MenuResponse[];
beforeAll(async () => {
    app = await server();
    const certificatedPhoneToken = new CertificatedPhoneToken(phone).sign();
    accessToken = (await userService.login({ businessRegistrationNumber, certificatedPhoneToken })).accessToken;
    storeId = (await storeService.getStoreList({ authorization: "Bearer " + accessToken })).stores[0].storeId;
    menus = (await menuService.getMenus({ authorization: "Bearer " + accessToken, storeid: storeId.toString() }))
        .categories
        .flatMap(category => category.menus);
});

afterAll(async () => {
    await app.close();
});

const customerPhone = '010-4321-8765';
let mileageId: number;
test('mileage', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/mileage?phone=${customerPhone}`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            storeid: storeId.toString()
        }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body) as Mileage.responseGetMileage;
    mileageId = body.mileageId;
    expect(body.mileageId).toBeDefined();
});

let orderId: number;
test('order', async () => {
    const response = await app.inject({
        method: 'POST',
        url: `/api/order`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            storeid: storeId.toString()
        },
        payload: {
            "totalPrice": menus[0].price * 2 + menus[1].price,
            "mileageId": mileageId,
            "menus": [
                {
                    "id": menus[0].id,
                    "count": 2
                },
                {
                    "id": menus[1].id,
                    "count": 1
                }
            ]
        }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body) as Order.responseOrder;
    orderId = body.orderId;
    expect(body.orderId).toBeDefined();
});
