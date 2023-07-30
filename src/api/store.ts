import { FastifyInstance, FastifyPluginAsync } from "fastify";
import storeService from "../services/storeService";
import * as Store from "../DTO/store.dto";

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
    server.post<{
        Headers: Store.requestNewStoreHeader,
        Body: Store.requestNewStore,
        reply:{
            200: Store.responseNewStore,
            '4xx': undefined
        }
    }>('/', async (request, reply) => {
        if(!request.body.name || !request.body.address || !request.body.openingHours || !request.headers.authorization){
            return reply
                .code(400)
                .send();
        }

        try {
            const result: Store.responseNewStore = await storeService.newStore(request.headers, request.body);
            reply
                .code(200)
                .send(result);
        } catch (e) {
            return reply
                .code(401)
                .send();
        }
    });

    server.get<{
        Headers: Store.requestStoreListHeader,
        reply:{
            200: Store.responseStoreList,
            '4xx': undefined
        }
    }>('/', async (request, reply) => {
        if(!request.headers.authorization){
            return reply
                .code(400)
                .send();
        }

        try {
            const result: Store.responseStoreList = await storeService.getStoreList(request.headers);
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
