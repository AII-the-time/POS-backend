import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { TokenForCertificatePhone } from '../../src/utils/jwt';

describe('JWT', () => {
    test('tokenForCertificatePhone', async () => {
        const token = new TokenForCertificatePhone('01012345678','987654').sign();
        expect(typeof token).toBe('string');

        expect(TokenForCertificatePhone.verify(token, '01012345678', '987654')).toBeTruthy();
        expect(TokenForCertificatePhone.verify(token, '01012345678', '123456')).toBeFalsy();
        expect(TokenForCertificatePhone.verify(token, '01012345679', '987654')).toBeFalsy(); 
    });
});
