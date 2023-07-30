import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import * as User from "../DTO/user.dto";
import { TokenForCertificatePhone, CertificatedPhoneToken, LoginToken } from "../utils/jwt";

const prisma = new PrismaClient();

export default {
    async sendCertificationCode({phone}:User.requestPhone): Promise<User.responsePhone>{
        //TODO: 인증번호 생성
        const certificationCode = "123456";
        const token = new TokenForCertificatePhone(phone, certificationCode).sign();
        return {tokenForCertificatePhone: token};
    },

    async certificatePhone({phone, certificationCode, phoneCertificationToken}:User.requestCertificatePhone): Promise<User.responseCertificatePhone>{
        if(!TokenForCertificatePhone.verify(phoneCertificationToken, phone, certificationCode)){
            throw new Error("인증번호가 일치하지 않습니다.");
        }
        const token = new CertificatedPhoneToken(phone).sign();
        return {certificatedPhoneToken: token};
    },

    async create({businessRegistrationNumber, certificatedPhoneToken}:User.requestLogin): Promise<User.User> {
        const certificatedPhone = CertificatedPhoneToken.decode(certificatedPhoneToken);
        try{
            return await prisma.user.create({
                data: {
                    businessRegistrationNumber: businessRegistrationNumber,
                    phoneNumber: certificatedPhone.phone
                }
            });
        }catch(e){
            throw new Error("db error");
        }
    },

    async login({businessRegistrationNumber, certificatedPhoneToken}:User.requestLogin): Promise<User.responseLogin>{
        let certificatedPhone: CertificatedPhoneToken;
        try{
            certificatedPhone = CertificatedPhoneToken.decode(certificatedPhoneToken);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }

        let user = await prisma.user.findFirst({
            where: {
                businessRegistrationNumber: businessRegistrationNumber,
                phoneNumber: certificatedPhone.phone
            }
        });
        if(!user){
            try{
                user = await this.create({businessRegistrationNumber, certificatedPhoneToken});
            }catch(e){
                throw e;
            }
        }
        
        const loginToken = new LoginToken(user.id);
        const accessToken = loginToken.signAccessToken();
        const refreshToken = loginToken.signRefreshToken();

        return {accessToken, refreshToken};
    },

    async refresh({authorization}:User.requestRefreshHeader): Promise<User.responseLogin>{
        authorization = authorization.replace("Bearer ", "");
        let token: LoginToken;
        try{
            token = LoginToken.decode(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }
        const user = await prisma.user.findUnique({
            where: {
                id: token.userId
            }
        });
        if(!user){
            throw new Error("존재하지 않는 유저입니다.");
        }
        const loginToken = new LoginToken(user.id);
        const accessToken = loginToken.signAccessToken();
        const refreshToken = loginToken.signRefreshToken();

        return {accessToken, refreshToken};
    }
}
