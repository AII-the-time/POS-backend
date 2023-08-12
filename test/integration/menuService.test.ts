import server from '../../src/server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { CertificatedPhoneToken } from "../../src/utils/jwt";
import userService from '../../src/services/userService';
import storeService from '../../src/services/storeService';
import * as Menu from "../../src/DTO/menu.dto";

let app: FastifyInstance;

const phone = '010-1234-5678';
const businessRegistrationNumber = '0123456789';
let accessToken: string;
let storeId: number;
beforeAll(async () => {
    app = await server();
    const certificatedPhoneToken = new CertificatedPhoneToken(phone).sign();
    accessToken = (await userService.login({ businessRegistrationNumber, certificatedPhoneToken })).accessToken;
    storeId = (await storeService.getStoreList({ authorization: "Bearer " + accessToken })).stores[0].storeId;
});

afterAll(async () => {
    await app.close();
});

test('get menu list', async () => {
    const response = await app.inject({
        method: 'GET',
        url: `/api/menu`,
        headers: {
            authorization: `Bearer ${accessToken}`,
            storeid: storeId.toString()
        }
    });
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body) as Menu.MenuList;
    expect(body).toEqual({
        categories: [
            {
                category: '커피',
                menus: [
                    {
                        id: expect.any(Number),
                        name: '아메리카노',
                        price: 2000,
                        option: expect.any(Array),
                    },
                    {
                        id: expect.any(Number),
                        name: '카페라떼',
                        price: 3000,
                        option: expect.any(Array),
                    }]
            },
            {
                category: '티&에이드',
                menus: [
                    { 
                        id: expect.any(Number),
                        name: '아이스티',
                        price: 2500,
                        option: expect.any(Array),
                    },
                ]
            }
        ]
    });
});
