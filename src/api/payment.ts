import { FastifyInstance,FastifyPluginAsync, FastifyRequest,FastifyReply } from "fastify";

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
        console.log(storeId);
        console.log(menus);
        const payment = await server.prisma.payment.create({
            data: {
                storeId: storeId,
                paymentMethod: "credit",
                paymentStatus: "paid",
                totalPrice: 2000,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });
        console.log(payment);
        reply.code(200).send(payment);
    });
}

export default api;
