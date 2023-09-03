import { FastifyInstance, FastifyPluginAsync } from "fastify";
import userService from "@services/userService";
import * as User from "@DTO/user.dto";

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
    server.post<{
        Body: User.requestPhone,
        Reply: {
            200: User.responsePhone,
            '4xx': undefined
        }
    }>('/phone', async (request, reply) => {
        if (!request.body.phone) {
            return reply
                .code(400)
                .send();
        }
        //TODO: 폰번호 형식 검사

        const result: User.responsePhone = await userService.sendCertificationCode(request.body);
        reply
            .code(200)
            .send(result);
    });

    server.post<{
        Body: User.requestCertificatePhone,
        Reply: {
            200: User.responseCertificatePhone,
            '4xx': undefined
        }
    }>('/phone/certificationCode', async (request, reply) => {
        if (!request.body.phone || !request.body.certificationCode || !request.body.phoneCertificationToken) {
            return reply
                .code(400)
                .send();
        }

        try {
            const result: User.responseCertificatePhone = await userService.certificatePhone(request.body);
            reply
                .code(200)
                .send(result);
        } catch (e) {
            return reply
                .code(401)
                .send();
        }

    });

    server.post<{
        Body: User.requestLogin,
        Reply: {
            200: User.responseLogin,
            '4xx': undefined
        }
    }>('/login', async (request, reply) => {
        if (!request.body.businessRegistrationNumber || !request.body.certificatedPhoneToken) {
            return reply
                .code(400)
                .send();
        }

        try {
            const result: User.responseLogin = await userService.login(request.body);
            reply
                .code(200)
                .send(result);
        } catch (e) {
            return reply
                .code(401)
                .send();
        }
    });

    server.post<{
        Headers: User.requestRefreshHeader,
        Reply: {
            200: User.responseRefresh,
            '4xx': undefined
        }
    }>('/refresh', async (request, reply) => {
        if (!request.headers.authorization) {
            return reply
                .code(400)
                .send();
        }

        try {
            const result: User.responseRefresh = await userService.refresh(request.headers);
            reply
                .code(200)
                .send(result);
        } catch (e) {
            return reply
                .code(401)
                .send();
        }
    });
}

export default api;
