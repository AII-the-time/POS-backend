import { FastifyInstance, FastifyPluginAsync } from "fastify";
import onError from "@hooks/onError";
import checkStoreIdUser from '@hooks/checkStoreIdUser';
import * as Menu from "@DTO/menu.dto";
import menuService from "@services/menuService";

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
    server.get<Menu.getMenuListInterface>(
        '/',
        {
            schema: Menu.getMenuListSchema,
            onError,
            preValidation: checkStoreIdUser
        },
        async (request, reply) => {
            const result = await menuService.getMenus({ storeid: Number(request.headers.storeid) });
            reply
                .code(200)
                .send(result);
        }
    );
}

export default api;
