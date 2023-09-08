import { FastifyInstance, FastifyPluginAsync } from "fastify";
import userService from "@services/userService";
import * as User from "@DTO/user.dto";

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
    server.post<User.phoneInterface>('/phone', {schema: User.phoneSchema}, async (request, reply) => {
        const result = await userService.sendCertificationCode(request.body);
        reply.code(200).send(result);
    });

    server.post<User.certificatePhoneInterface>('/phone/certificationCode', {schema: User.certificatePhoneSchema}, async (request, reply) => {
        try {
            const result = await userService.certificatePhone(request.body);
            reply.code(200).send(result);
        } catch (e) {
            return reply.code(401).send();
        }
    });

    server.post<User.loginInterface>('/login', {schema: User.loginSchema}, async (request, reply) => {
        try {
            const result = await userService.login(request.body);
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
