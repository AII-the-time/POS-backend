import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Mileage from '@DTO/mileage.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('check mileage1 after order', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/mileage?phone=${testValues.customerPhone1}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Mileage.getMileageInterface['Reply']['200'];
        expect(body.mileage).toBe(Math.floor((2500 * 68 + 6000)*0.05).toString());
    });

    test('check mileage2 after order', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/mileage?phone=${testValues.customerPhone2}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Mileage.getMileageInterface['Reply']['200'];
        expect(body.mileage).toBe(Math.floor(2500*4*0.05 + 6000*4*0.05).toString());
    });
}
