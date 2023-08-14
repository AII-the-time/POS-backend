import { test, expect } from '@jest/globals';
import { FastifyInstance } from 'fastify';

export default async (app:FastifyInstance,apis:[string,'POST'|'GET'|'PUT'|'PATCH'][]) => {
    const responses = await Promise.all(apis.map(async (api) => {
        const response = await app.inject({
            method: api[1],
            url: api[0],
            payload: {}
        });
        return response;
    }));
    responses.forEach((response) => {
        expect(response.statusCode).toBe(400);
    });
}
