import server from '../../src/server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let app: FastifyInstance;

beforeAll( async () =>{
    app = await server();
});

afterAll(async () =>{
    await app.close();
});

//전화번호 인증을 위한 토큰
let tokenForCertificatePhone: string;

describe('login', () => {
    test('send CertificationCode', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/phone',
            payload: {
                phone: '010-1234-5678'
            }
        });
        let body = JSON.parse(response.body);
        tokenForCertificatePhone = body.tokenForCertificatePhone;

        expect(response.statusCode).toBe(200);
    });

    test('certificate phone:success', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/phone/certificationCode',
            payload: {
                phone: '010-1234-5678',
                certificationCode: '123456',
                phoneCertificationToken: tokenForCertificatePhone
            }
        });

        expect(response.statusCode).toBe(200);
    });

    test('certificate phone:fail', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/api/user/phone/certificationCode',
            payload: {
                phone: '010-1234-5678',
                certificationCode: '111222',
                phoneCertificationToken: tokenForCertificatePhone
            }
        });

        expect(response.statusCode).toBe(401);
    });
});
