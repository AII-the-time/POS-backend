import { FastifyInstance,FastifyPluginAsync } from "fastify";
import mileageService from "../services/mileageService";
import { StoreAuthorizationHeader } from "../DTO/index.dto";
import * as Mileage from "../DTO/mileage.dto";

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.get<{
        Headers: StoreAuthorizationHeader,
        Querystring: Mileage.requestGetMileage,
        Reply: {
            200: Mileage.responseGetMileage,
            '4xx': undefined
        }
    }>('/', async (request, reply) => {
        if(!request.headers.storeid || !request.headers.authorization || !request.query.phone) {
            return reply
                .code(400)
                .send();
        }

        try{
            const result = await mileageService.getMileage(request.headers, request.query);
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

    server.post<{
        Headers: StoreAuthorizationHeader,
        Body: Mileage.requestRegisterMileage,
        Reply: {
            200: Mileage.responseRegisterMileage,
            '4xx': undefined
        }
    }>('/', async (request, reply) => {
        if(!request.headers.storeid || !request.headers.authorization || !request.body.phone) {
            return reply
                .code(400)
                .send();
        }

        try{
            const result = await mileageService.registerMileage(request.headers, request.body);
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

    server.patch<{
        Headers: StoreAuthorizationHeader,
        Body: Mileage.requestSaveMileage,
        Reply: {
            200: Mileage.responseSaveMileage,
            '4xx': undefined
        }
    }>('/', async (request, reply) => {
        if(!request.headers.storeid || !request.headers.authorization || !request.body.mileageId || !request.body.mileage) {
            return reply
                .code(400)
                .send();
        }

        try{
            const result = await mileageService.saveMileage(request.headers, request.body);
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
