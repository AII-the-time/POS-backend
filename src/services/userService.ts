import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import * as User from "../DTO/user.dto";
import { TokenForCertificatePhone,CertificatedPhoneToken } from "../utils/jwt";

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
    }
}

