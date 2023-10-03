import server from '../../src/server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import * as User from '../../src/DTO/user.dto';
import test400 from './400test';

let app: FastifyInstance;

beforeAll(async () => {
  app = await server();
});

afterAll(async () => {
  await app.close();
});

const phone = '010-1234-5678';
const businessRegistrationNumber = '1234567890';
let tokenForCertificatePhone: string;
let certificatedPhoneToken: string;
let accessToken: string;
let refreshToken: string;

describe('login', () => {
  test('ping', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/ping',
    });
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body) as { data: string };
    expect(body.data).toBe('pong');
  });
  test('400 test', async () => {
    await test400(app, [
      ['/api/user/phone', 'POST'],
      ['/api/user/phone/certificationCode', 'POST'],
      ['/api/user/login', 'POST'],
      ['/api/user/refresh', 'POST'],
    ]);
  });

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
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  test('login', async () => {
    //유효기간이 다른 accessToken을 발급받기 위해 1초 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

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
    expect(body.accessToken).not.toBe(accessToken);
    expect(body.refreshToken).not.toBe(refreshToken);
    accessToken = body.accessToken;
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
    //유효기간이 다른 accessToken을 발급받기 위해 1초 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
    expect(body.accessToken).not.toBe(accessToken);
    expect(body.refreshToken).not.toBe(refreshToken);
    accessToken = body.accessToken as string;
    refreshToken = body.refreshToken as string;
  });
});
