import server from '../../src/server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { PrismaClient } from "@prisma/client";
import { CertificatedPhoneToken } from "../../src/utils/jwt";
import userService from '../../src/services/userService';
import * as Store from "../../src/DTO/store.dto";

const prisma = new PrismaClient();

let app: FastifyInstance;

const phone = '010-1111-2222';
const businessRegistrationNumber = '1122233444';
let accessToken: string;

beforeAll( async () =>{
    app = await server();
    const certificatedPhoneToken = new CertificatedPhoneToken(phone).sign();
    accessToken = (await userService.login({businessRegistrationNumber, certificatedPhoneToken})).accessToken;
});

afterAll(async () =>{
    await app.close();
});

const storeName = '테스트 매장';
const storeAddress = '서울시 강남구';
const defaultOpeningHours: Array<{
    day: string,
    open: string|null,
    close: string|null,
}> = [
    {
        day: "일",
        open: null,
        close: null
    },
    ...["월", "화", "수", "목", "금", "토"].map(day => ({
        day: day,
        open: '09:00',
        close: '18:00'
    })),
    {
        day: "공휴일",
        open: '10:00',
        close: '17:00'
    }
]

let storeId: number;
test('new store', async () => {
    const response = await app.inject({
        method: 'POST',
        url: '/api/store',
        payload: {
            name: storeName,
            address: storeAddress,
            openingHours: defaultOpeningHours
        },
        headers: {
            authorization: accessToken
        }
    });
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body) as Store.responseNewStore;
    expect(body).toHaveProperty('storeId');
    storeId = body.storeId;
});

test('get store list', async () => {
    const response = await app.inject({
        method: 'GET',
        url: '/api/store',
        headers: {
            authorization: accessToken
        }
    });
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body) as Store.responseStoreList;
    expect(body).toHaveProperty('stores');
    expect(body.stores.length).toBeGreaterThan(0);
    const lastStore = body.stores[body.stores.length - 1];
    expect(lastStore).toHaveProperty('storeId');
    expect(lastStore).toHaveProperty('name');
    expect(lastStore).toHaveProperty('address');
    expect(lastStore).toEqual({
        storeId: storeId,
        name: storeName,
        address: storeAddress
    });
});
