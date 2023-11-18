import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    test('ping', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/api/ping',
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as { data: string };
        expect(body.data).toBe('pong');
    });

    test('notDefinederror', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/notDefinederror',
        });
        expect(response.statusCode).toBe(500);
    });

    test('human error', async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/api/notDefinedOnConfigerror',
        });
        expect(response.statusCode).toBe(500);
        const body = JSON.parse(response.body) as ErrorInterface;
        expect(body.message).toBe('notDefinedOnConfigerror');
    });

    test('notFound', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/notFound',
        });
        expect(response.statusCode).toBe(404);
    });

    test('400', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/phone',
        });
        expect(response.statusCode).toBe(400);
    });
};
