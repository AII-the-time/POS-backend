import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { tokenForCertificatePhone } from '../../src/utils/jwt';

describe('JWT', () => {
    test('tokenForCertificatePhone', async () => {
        const token = new tokenForCertificatePhone('010-1234-5678','987654').sign();
        expect(typeof token).toBe('string');

        expect(tokenForCertificatePhone.verify(token, '010-1234-5678', '987654')).toBeTruthy();
        expect(tokenForCertificatePhone.verify(token, '010-1234-5678', '123456')).toBeFalsy();
        expect(tokenForCertificatePhone.verify(token, '010-1234-5679', '987654')).toBeFalsy(); 
    });
});
