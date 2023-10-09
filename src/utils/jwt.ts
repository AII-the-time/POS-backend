import jwt from 'jsonwebtoken';
import config from '@config';
import crypto from 'crypto';
import { UserAuthorizationError, UncorrectTokenError } from '@errors';

export class TokenForCertificatePhone {
  phone: string;
  encryptedCertificationCode: string;

  constructor(phone: string, certificationCode: string) {
    this.phone = phone;
    this.encryptedCertificationCode = this.encryptCertificationCode(
      phone,
      certificationCode
    );
  }

  private encryptCertificationCode(
    phone: string,
    certificationCode: string
  ): string {
    const hash = crypto.createHash('sha512');
    hash.update(`${phone}${certificationCode}${config.salt}`);
    return hash.digest('hex');
  }

  sign(): string {
    return jwt.sign({ ...this }, config.jwtSecretKey, { expiresIn: '3m' });
  }

  public static verify(
    token: string,
    phone: string,
    certificationCode: string
  ): boolean {
    const decoded = jwt.verify(
      token,
      config.jwtSecretKey
    ) as TokenForCertificatePhone;
    const hash = crypto.createHash('sha512');
    hash.update(`${phone}${certificationCode}${config.salt}`);
    const encryptedCertificationCode = hash.digest('hex');
    if (decoded.encryptedCertificationCode == encryptedCertificationCode)
      return true;
    return false;
  }
}

export class CertificatedPhoneToken {
  phone: string;

  constructor(phone: string) {
    this.phone = phone;
  }

  sign(): string {
    return jwt.sign({ ...this }, config.jwtSecretKey, { expiresIn: '3m' });
  }

  public static decode(token: string): CertificatedPhoneToken {
    try {
      const decoded = jwt.verify(
        token,
        config.jwtSecretKey
      ) as CertificatedPhoneToken;
      return decoded;
    } catch (err) {
      throw new UncorrectTokenError('토큰이 유효하지 않습니다.');
    }
  }
}

export class LoginToken {
  userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  signAccessToken(): string {
    return jwt.sign({ ...this }, config.jwtSecretKey, { expiresIn: '1d' });
  }

  signRefreshToken(): string {
    return jwt.sign({ ...this }, config.jwtSecretKey, { expiresIn: '14d' });
  }

  public static getUserId(token: string): number {
    try {
      const decoded = jwt.verify(token, config.jwtSecretKey) as LoginToken;
      return decoded.userId;
    } catch (err) {
      throw new UserAuthorizationError('유저 인증에 실패했습니다');
    }
  }
}
