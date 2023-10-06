import { PrismaClient } from '@prisma/client';
import * as User from '@DTO/user.dto';
import {
  TokenForCertificatePhone,
  CertificatedPhoneToken,
  LoginToken,
} from '@utils/jwt';
import * as E from '@errors';

const prisma = new PrismaClient();

export default {
  async sendCertificationCode({
    phone,
  }: User.phoneInterface['Body']): Promise<
    User.phoneInterface['Reply']['200']
  > {
    //TODO: 인증번호 생성
    const certificationCode = '123456';
    const token = new TokenForCertificatePhone(phone, certificationCode).sign();
    return { tokenForCertificatePhone: token };
  },

  async certificatePhone({
    phone,
    certificationCode,
    phoneCertificationToken,
  }: User.certificatePhoneInterface['Body']): Promise<
    User.certificatePhoneInterface['Reply']['200']
  > {
    if (
      !TokenForCertificatePhone.verify(
        phoneCertificationToken,
        phone,
        certificationCode
      )
    ) {
      throw new E.UserAuthorizationError('인증번호가 일치하지 않습니다.');
    }
    const token = new CertificatedPhoneToken(phone).sign();
    return { certificatedPhoneToken: token };
  },

  async create({
    businessRegistrationNumber,
    certificatedPhoneToken,
  }: User.loginInterface['Body']): Promise<User.User> {
    const certificatedPhone = CertificatedPhoneToken.decode(
      certificatedPhoneToken
    );
    return await prisma.user.create({
      data: {
        businessRegistrationNumber: businessRegistrationNumber,
        phoneNumber: certificatedPhone.phone,
      },
    });
  },

  async login({
    businessRegistrationNumber,
    certificatedPhoneToken,
  }: User.loginInterface['Body']): Promise<
    User.loginInterface['Reply']['200']
  > {
    let certificatedPhone: CertificatedPhoneToken;
    try {
      certificatedPhone = CertificatedPhoneToken.decode(certificatedPhoneToken);
    } catch (e) {
      throw new E.UserAuthorizationError('토큰이 유효하지 않습니다.');
    }

    let user = await prisma.user.findFirst({
      where: {
        businessRegistrationNumber: businessRegistrationNumber,
        phoneNumber: certificatedPhone.phone,
      },
    });
    if (!user) {
      user = await this.create({
        businessRegistrationNumber,
        certificatedPhoneToken,
      });
    }

    const loginToken = new LoginToken(user.id);
    const accessToken = loginToken.signAccessToken();
    const refreshToken = loginToken.signRefreshToken();

    return { accessToken, refreshToken };
  },
  async refresh({
    userId,
  }: User.refreshInterface['Body']
  ): Promise<User.refreshInterface['Reply']['200']> {
    const loginToken = new LoginToken(userId);
    const accessToken = loginToken.signAccessToken();
    const refreshToken = loginToken.signRefreshToken();

    return { accessToken, refreshToken };
  },
  humanError: new E.NotDefinedOnConfigError('humanError'),
};
