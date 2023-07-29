import { FastifyInstance,FastifyPluginAsync, FastifyRequest,FastifyReply } from "fastify";
import menuService from "../services/menuService";
import { StoreAuthorizationHeader } from "../DTO/index.dto";
import { MenuList } from "../DTO/menu.dto";

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.get<{
        Headers: StoreAuthorizationHeader,
        Reply: {
            200: MenuList,
            '4xx': undefined
        }
    }>('/', async (request, reply) => {
        if(!request.headers.storeid || !request.headers.authorization) {
            return reply
                .code(400)
                .send();
        }

        const storeId = Number(request.headers.storeid);
        const Authorization = request.headers.authorization;

        const categories: MenuList = await menuService.getMenus(storeId);
        reply
            .code(200)
            .send(categories);
    });
}

export default api;
