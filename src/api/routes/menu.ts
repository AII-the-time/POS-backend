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
            const result = await menuService.getMenuList({ storeid: Number(request.headers.storeid) });
            reply
                .code(200)
                .send(result);
        }
    );

    server.get<Menu.getMenuInterface>(
        '/:menuId',
        {
            schema: Menu.getMenuSchema,
            onError,
            preValidation: checkStoreIdUser
        },
        async (request, reply) => {
            const result = await menuService.getMenu({ storeid: Number(request.headers.storeid)}, request.params);
            reply
                .code(200)
                .send(result);
        }
    );
}

export default api;
