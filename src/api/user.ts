import { FastifyInstance,FastifyPluginAsync, FastifyRequest,FastifyReply } from "fastify";
import userService from "../services/userService";
import { requestPhone, responsePhone } from "../DTO/user.dto";

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.post<{
        Body: requestPhone,
        Reply: {
            200: responsePhone,
            '4xx': undefined
        }
    }>('/phone', async (request, reply) => {
        if(!request.body.phone) {
            return reply
                .code(400)
                .send();
        }
        const result:responsePhone = await userService.sendCertificationCode(request.body);
        reply
            .code(200)
            .send(result);
    });
}

export default api;
