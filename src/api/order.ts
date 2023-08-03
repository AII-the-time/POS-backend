import { FastifyInstance,FastifyPluginAsync } from "fastify";
import orderService from "../services/orderService";
import { StoreAuthorizationHeader } from "../DTO/index.dto";
import * as Order from "../DTO/order.dto";

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.post<{
        Headers: StoreAuthorizationHeader,
        Body: Order.requestOrder,
        Reply: {
            200: Order.responseOrder,
            '4xx': undefined
        }
    }>('/', async (request, reply) => {
        if(!request.headers.storeid || !request.headers.authorization) {
            return reply
                .code(400)
                .send();
        }

        try{
            const result = await orderService.order(request.headers, request.body);
            reply
                .code(200)
                .send(result);
        }
        catch(e) {
            return reply
                .code(404)
                .send();
        }
    });
}

export default api;
