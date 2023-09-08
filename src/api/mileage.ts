import { FastifyInstance,FastifyPluginAsync } from "fastify";
import mileageService from "@services/mileageService";
import { StoreAuthorizationHeader } from "@DTO/index.dto";
import * as Mileage from "@DTO/mileage.dto";

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.get<Mileage.getMileageInterface>('/',{schema:Mileage.getMileageSchema}, async (request, reply) => {
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

    server.post<Mileage.registerMileageInterface>('/',{schema:Mileage.registerMileageSchema}, async (request, reply) => {
        try{
            const result = await mileageService.registerMileage(request.headers, request.body);
            reply
                .code(200)
                .send(result);
        }
        catch(e) {
            return reply
                .code(401)
                .send();
        }
    });

    server.patch<Mileage.saveMileageInterface>('/',{schema:Mileage.saveMileageSchema}, async (request, reply) => {
        try{
            const result = await mileageService.saveMileage(request.headers, request.body);
            reply
                .code(200)
                .send(result);
        }
        catch(e) {
            return reply
                .code(401)
                .send();
        }
    });
}

export default api;
