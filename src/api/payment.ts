import { FastifyInstance,FastifyPluginAsync, FastifyRequest,FastifyReply } from "fastify";
import orderService from "../services/orderService";

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.post<{
        Body: {
            storeId: number;
            menus: Array<{id:number,count:number}>;
        },
        Reply: {
            menus: Array<Object>;
        }
    }>('/', async (request, reply) => {
        const storeId = request.body.storeId;
        const menus: {id:number,count:number}[] = request.body.menus;
        try{
            const payment = await orderService.orderMenus({storeId, menus});
            reply.code(200).send(payment);
        } catch(e) {
            return reply
                .code(404)
                .send();
        }
    });

    server.get<{
        Params: {
            storeId: string;
        },
        Reply: {
            menus: Array<Object>;
        }
    }>('/:storeId', async (request, reply) => {
        const storeId = Number(request.params.storeId);
        try{
            const payments = await orderService.getPayments(storeId);
            reply.code(200).send(payments);
        }
        catch(e) {
            return reply
                .code(404)
                .send();
        }
    });
}

export default api;
