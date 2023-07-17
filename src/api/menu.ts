import { FastifyInstance,FastifyPluginAsync, FastifyRequest,FastifyReply } from "fastify";
import menuService from "../services/menuService";

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.get<{
        Params: {
            storeId: String;
        },
        Reply: {
            menus: Array<Object>;
        }
    }>('/:storeId', async (request, reply) => {
        const storeId = Number(request.params.storeId);
        const menus = await menuService.getMenus(server,storeId);
        if(menus.length === 0) {
            return reply
                .code(404)
                .send();
        }

        reply
            .code(200)
            .send({menus});
    });
}

export default api;
