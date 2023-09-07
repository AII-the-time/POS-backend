import { FastifyInstance, FastifyPluginAsync } from "fastify";
import userService from "@services/userService";
import * as User from "@DTO/user.dto";

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
    server.post<User.phoneInterface>('/phone', {schema: User.phoneSchema}, async (request, reply) => {
        const result = await userService.sendCertificationCode(request.body);
        reply.code(200)
            .send(result);
    });

    server.post<{
        Body: User.requestCertificatePhone,
        Reply: {
            200: User.responseCertificatePhone,
            '4xx': undefined
        }
    }>('/phone/certificationCode', {schema: User.certificatePhoneSchema}, async (request, reply) => {
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
    }>('/login', {schema: User.loginSchema}, async (request, reply) => {
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

    server.post<User.refreshInterface>('/refresh',{schema: User.refreshSchema}, async (request, reply) => {
        if (!request.headers.authorization) {
            return reply
                .code(400)
                .send();
        }

        try {
            const result = await userService.refresh(request.headers);
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
