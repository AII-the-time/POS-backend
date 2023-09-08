import { FastifyInstance, FastifyPluginAsync } from "fastify";
import storeService from "@services/storeService";
import * as Store from "@DTO/store.dto";

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
    server.post<Store.newStoreInterface>('/',{schema:Store.newStoreSchema}, async (request, reply) => {
        try {
            const result = await storeService.newStore(request.headers, request.body);
            reply
                .code(200)
                .send(result);
        } catch (e) {
            return reply
                .code(401)
                .send();
        }
    });

    server.get<Store.storeListInterface>('/',{schema:Store.storeListSchema}, async (request, reply) => {
        try {
            const result = await storeService.getStoreList(request.headers);
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
