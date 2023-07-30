import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { TokenForCertificatePhone } from '../../src/utils/jwt';

describe('JWT', () => {
    test('tokenForCertificatePhone', async () => {
        const token = new TokenForCertificatePhone('010-1234-5678','987654').sign();
        expect(typeof token).toBe('string');

        expect(TokenForCertificatePhone.verify(token, '010-1234-5678', '987654')).toBeTruthy();
        expect(TokenForCertificatePhone.verify(token, '010-1234-5678', '123456')).toBeFalsy();
        expect(TokenForCertificatePhone.verify(token, '010-1234-5679', '987654')).toBeFalsy(); 
    });
});
