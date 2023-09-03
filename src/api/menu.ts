import { FastifyInstance,FastifyPluginAsync } from "fastify";
import menuService from "@services/menuService";
import { StoreAuthorizationHeader } from "@DTO/index.dto";
import { MenuList } from "@DTO/menu.dto";

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

        try{
            const categories: MenuList = await menuService.getMenus(request.headers)
            reply
                .code(200)
                .send(categories);
        } catch(e) {
            return reply
                .code(404)
                .send();
        }
    });
}

export default api;
