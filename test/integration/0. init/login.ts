import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import { expect, test } from '@jest/globals';
import * as User from '@DTO/user.dto';

export default (app: FastifyInstance) => () => {
    const phone = '01012345678';
    const businessRegistrationNumber = '1234567890';
    let tokenForCertificatePhone: string;
    let certificatedPhoneToken: string;
    let refreshToken: string;

    test('send CertificationCode', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/phone',
            payload: {
                phone: phone,
            },
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(
            response.body
        ) as User.phoneInterface['Reply']['200'];
        expect(body).toHaveProperty('tokenForCertificatePhone');
        tokenForCertificatePhone = body.tokenForCertificatePhone as string;
    });

    test('send CertificationCode: fail', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/phone',
            payload: {
                phone: '010esrdfsd',
            },
        });
        expect(response.statusCode).toBe(401);
    });

    test('certificate phone:success', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/phone/certificationCode',
            payload: {
                phone: phone,
                certificationCode: '123456',
                phoneCertificationToken: tokenForCertificatePhone,
            },
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(
            response.body
        ) as User.certificatePhoneInterface['Reply']['200'];
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
                phoneCertificationToken: tokenForCertificatePhone,
            },
        });
        expect(response.statusCode).toBe(401);
    });

    test('new user: fail', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/login',
            payload: {
                businessRegistrationNumber: businessRegistrationNumber,
                certificatedPhoneToken: 'asdf',
            },
        });
        expect(response.statusCode).toBe(401);
    });

    test('new user', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/login',
            payload: {
                businessRegistrationNumber: businessRegistrationNumber,
                certificatedPhoneToken: certificatedPhoneToken,
            },
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(
            response.body
        ) as User.loginInterface['Reply']['200'];
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
    });

    test('login', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/login',
            payload: {
                businessRegistrationNumber: businessRegistrationNumber,
                certificatedPhoneToken: certificatedPhoneToken,
            },
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(
            response.body
        ) as User.loginInterface['Reply']['200'];
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
        refreshToken = body.refreshToken;
    });

    test('refresh token:fail', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/refresh',
            headers: {
                Authorization: `Bearer ${refreshToken + 1}`,
            },
        });
        expect(response.statusCode).toBe(401);
    });

    test('refresh token', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/refresh',
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        });
        expect(response.statusCode).toBe(200);

        const body = JSON.parse(
            response.body
        ) as User.refreshInterface['Reply']['200'];
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
    });
}
