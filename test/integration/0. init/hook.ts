import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import { LoginToken } from '@utils/jwt';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    const accessToken = new LoginToken(1).signAccessToken();

    test('checkUser: without authorization header', async () => {
        const response = await app.inject({
            method: 'POST',
            url: `/api/store`,
        });
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body) as ErrorInterface;
        expect(body.message).toBe('헤더에 Authorization이 없습니다');
    });

    test('checkStoreIdUser: without authorization header', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu`,
            headers: {
                storeid: '1',
            },
        });
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body) as ErrorInterface;
        expect(body.message).toBe('헤더에 Authorization이 없습니다');
    });

    test('checkStoreIdUser: without storeid header', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu`,
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body) as ErrorInterface;
        expect(body.message).toBe('헤더에 storeid가 없습니다');
    });

    test('checkStoreIdUser: without storeid header', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu`,
            headers: {
                authorization: `Bearer ${accessToken}1`,
                storeid: '1',
            },
        });
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body) as ErrorInterface;
        expect(body.message).toBe('유저 인증에 실패했습니다');
    });

    test('checkStoreIdUser: without storeid header', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu`,
            headers: {
                authorization: `Bearer ${accessToken}`,
                storeid: '1',
            },
        });
        expect(response.statusCode).toBe(401);
        const body = JSON.parse(response.body) as ErrorInterface;
        expect(body.message).toBe('가게 인증에 실패했습니다');
    });

};
