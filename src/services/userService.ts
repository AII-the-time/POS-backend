import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { requestPhone, responsePhone } from "../DTO/user.dto";
import { tokenForCertificatePhone } from "../utils/jwt";

const prisma = new PrismaClient();

export default {
    async sendCertificationCode({phone}:requestPhone): Promise<responsePhone>{
        //TODO: 인증번호 생성
        const certificationCode = "123456";
        const token = new tokenForCertificatePhone(phone, certificationCode).sign();
        return {tokenForCertificatePhone: token};
    }
}
