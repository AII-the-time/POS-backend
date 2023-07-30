import server from '../../src/server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { PrismaClient } from "@prisma/client";
import * as User from "../../src/DTO/user.dto";

const prisma = new PrismaClient();

let app: FastifyInstance;

beforeAll( async () =>{
    app = await server();
});

afterAll(async () =>{
    await app.close();
});

const phone = '010-1234-5678';
const businessRegistrationNumber = '1234567890';
let tokenForCertificatePhone: string;
let certificatedPhoneToken: string;
let accessToken: string;
let refreshToken: string;

describe('login', () => {
    test('send CertificationCode', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/phone',
            payload: {
                phone: phone
            }
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body) as User.responsePhone;
        expect(body).toHaveProperty('tokenForCertificatePhone');
        tokenForCertificatePhone = body.tokenForCertificatePhone;
    });

    test('certificate phone:success', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/phone/certificationCode',
            payload: {
                phone: phone,
                certificationCode: '123456',
                phoneCertificationToken: tokenForCertificatePhone
            }
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body) as User.responseCertificatePhone;
        expect(body).toHaveProperty('certificatedPhoneToken');
        certificatedPhoneToken = body.certificatedPhoneToken;
    });

    test('certificate phone:fail', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/phone/certificationCode',
            payload: {
                phone: phone,
                certificationCode: '111222',
                phoneCertificationToken: tokenForCertificatePhone
            }
        });
        expect(response.statusCode).toBe(401);
    });

    test('new user', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/login',
            payload: {
                businessRegistrationNumber: businessRegistrationNumber,
                certificatedPhoneToken: certificatedPhoneToken
            }
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body) as User.responseLogin;
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
    });

    test('login', async () => {
        //유효기간이 다른 accessToken을 발급받기 위해 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await app.inject({
            method: 'POST',
            url: '/api/user/login',
            payload: {
                businessRegistrationNumber: businessRegistrationNumber,
                certificatedPhoneToken: certificatedPhoneToken
            }
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body) as User.responseLogin;
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
        expect(body.accessToken).not.toBe(accessToken);
        expect(body.refreshToken).not.toBe(refreshToken);
        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
    });

    test('refresh token', async () => {
        //유효기간이 다른 accessToken을 발급받기 위해 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/refresh',
            headers: {
                Authorization: `Bearer ${refreshToken}`
            }
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(response.body) as User.responseRefresh;
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
        expect(body.accessToken).not.toBe(accessToken);
        expect(body.refreshToken).not.toBe(refreshToken);
        accessToken = body.accessToken;
        refreshToken = body.refreshToken;
    });
});
