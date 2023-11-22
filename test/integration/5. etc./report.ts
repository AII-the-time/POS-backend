import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import * as Report from '@DTO/report.dto';
import testValues from '../testValues';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('get report', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/report`,
            headers: testValues.testStoreHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Report.reportInterface['Reply']['200'];
        console.log(body);
    });
};
