import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import { LoginToken } from '@utils/jwt';
import * as Store from '@DTO/store.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    const accessToken = new LoginToken(1).signAccessToken();
    const storeName = '소예다방';
    const storeAddress = '서울시 강남구';
    const defaultOpeningHours: Array<{
        day: string;
        open: string | null;
        close: string | null;
    }> = [
            {
                day: '일',
                open: null,
                close: null,
            },
            ...['월', '화', '수', '목', '금', '토'].map((day) => ({
                day: day,
                open: '09:00',
                close: '18:00',
            })),
            {
                day: '공휴일',
                open: '10:00',
                close: '17:00',
            },
        ];

    test('new store', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/store',
            payload: {
                name: "테스트 매장",
                address: "테스트 주소",
                openingHours: defaultOpeningHours,
            },
            headers: {
                authorization: accessToken,
            },
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(
            response.body
        ) as Store.newStoreInterface['Reply']['200'];
        expect(body).toHaveProperty('storeId');
    });

    test('get store list', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/store',
            headers: {
                authorization: accessToken,
            },
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(
            response.body
        ) as Store.storeListInterface['Reply']['200'];
        expect(body).toHaveProperty('stores');
        expect(body.stores.length).toEqual(1);
        const lastStore = body.stores[0];
        expect(lastStore).toEqual({
            storeId: 1,
            name: "테스트 매장",
            address: "테스트 주소",
        });
    });

    test('update store', async () => {
        const response = await app.inject({
            method: 'PUT',
            url: '/api/store',
            payload: {
                name: storeName,
                address: storeAddress,
                openingHours: defaultOpeningHours,
            },
            headers: {
                authorization: accessToken,
                storeid: '1'
            },
        });
        expect(response.statusCode).toBe(201);

        const body = JSON.parse(
            response.body
        ) as Store.updateStoreInterface['Reply']['201'];
        expect(body).toHaveProperty('storeId');
        expect(body.storeId).toBe(1);
    });

    test('register test store', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/store/test',
            payload: {
                name: '테스트 매장',
                address: '테스트 주소',
                openingHours: defaultOpeningHours,
            },
            headers: {
                authorization: accessToken,
            },
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(
            response.body
        ) as Store.newStoreInterface['Reply']['200'];
        expect(body).toHaveProperty('storeId');
    });

    test('get store list', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/store',
            headers: {
                authorization: accessToken,
            },
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(
            response.body
        ) as Store.storeListInterface['Reply']['200'];
        expect(body).toHaveProperty('stores');
        expect(body.stores.length).toEqual(2);
        expect(body.stores).toEqual([
            {
                storeId: 1,
                name: storeName,
                address: storeAddress,
            },
            {
                storeId: 2,
                name: "테스트 매장",
                address: "테스트 주소",
            },
        ]);
    });
}
