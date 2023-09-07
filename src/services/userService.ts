import { PrismaClient } from "@prisma/client";
import * as User from "@DTO/user.dto";
import { TokenForCertificatePhone, CertificatedPhoneToken, LoginToken } from "@utils/jwt";

const prisma = new PrismaClient();

export default {
    async sendCertificationCode({phone}:User.phoneInterface['Body']): Promise<User.phoneInterface['Reply']['200']>{
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

    async refresh({authorization}:User.refreshInterface['Headers']): Promise<User.refreshInterface['Reply']['200']>{
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }
        const loginToken = new LoginToken(userId);
        const accessToken = loginToken.signAccessToken();
        const refreshToken = loginToken.signRefreshToken();

        return {accessToken, refreshToken};
    }
}

