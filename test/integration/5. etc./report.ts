import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import * as Report from '@DTO/report.dto';
import testValues from '../testValues';
import { PrismaClient } from '@prisma/client';
import { expect, test, beforeAll } from '@jest/globals';

const prisma = new PrismaClient();

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
