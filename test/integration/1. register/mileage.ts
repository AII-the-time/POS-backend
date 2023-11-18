import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Mileage from '@DTO/mileage.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('mileage', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/mileage?phone=${testValues.customerPhone1}`,
            headers: testValues.storeHeader,
        });

        expect(response.statusCode).toBe(404);
        const body = JSON.parse(response.body) as ErrorInterface;
        expect(body.message).toBe('해당하는 마일리지가 없습니다.');
        expect(body.toast).toBe('마일리지을(를) 찾을 수 없습니다.');
    });

    test('register mileage', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/mileage`,
            headers: testValues.storeHeader,
            payload: {
                phone: testValues.customerPhone1,
            },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(
            response.body
        ) as Mileage.registerMileageInterface['Reply']['200'];
        expect(body.mileageId).toBeDefined();
        testValues.setValues('mileageId1', body.mileageId);
    });

    test('register mileage with not correct phone check', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/mileage`,
            headers: testValues.storeHeader,
            payload: {
                phone: testValues.wrongPhone,
            },
        });
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body) as ErrorInterface;
        expect(body.message).toBe('입력된 전화번호이(가) 양식과 맞지 않습니다.');
    });

    test('exist mileage check', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/mileage`,
            headers: testValues.storeHeader,
            payload: {
                phone: testValues.customerPhone1,
            },
        });
        expect(response.statusCode).toBe(409);
        const body = JSON.parse(response.body) as ErrorInterface;
        expect(body.message).toBe('입력된 전화번호가 이미 존재합니다.');
        expect(body.toast).toBe('입력된 전화번호가 이미 존재합니다.');
    });

    test('add mileage', async () => {
        const response = await app.inject({
            method: 'PATCH',
            url: `/api/mileage`,
            headers: testValues.storeHeader,
            payload: {
                mileageId: testValues.mileageId1,
                mileage: 1000,
            },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(
            response.body
        ) as Mileage.saveMileageInterface['Reply']['200'];
        expect(body.mileage).toBe('1000');
    });

    test('get mileage', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/mileage?phone=${testValues.customerPhone1}`,
            headers: testValues.storeHeader,
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(
            response.body
        ) as Mileage.getMileageInterface['Reply']['200'];
        expect(body.mileage).toBe('1000');
        expect(body.mileageId).toBe(testValues.mileageId1);
    });

    test('register second mileage', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/mileage`,
            headers: testValues.storeHeader,
            payload: {
                phone: testValues.customerPhone2,
            },
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(
            response.body
        ) as Mileage.registerMileageInterface['Reply']['200'];
        expect(body.mileageId).toBeDefined();
        testValues.setValues('mileageId2', body.mileageId);
    });
}
