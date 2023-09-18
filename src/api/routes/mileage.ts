import { FastifyInstance,FastifyPluginAsync } from "fastify";
import mileageService from "@services/mileageService";
import onError from "@hooks/onError";
import * as Mileage from "@DTO/mileage.dto";
import checkStoreIdUser from '@hooks/checkStoreIdUser';

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.get<Mileage.getMileageInterface>('/',{schema:Mileage.getMileageSchema,onError,preValidation: checkStoreIdUser}, async (request, reply) => {
        const result = await mileageService.getMileage({ storeid: Number(request.headers.storeid) }, request.query);
        reply
            .code(200)
            .send(result);
    });

  server.post<Mileage.registerMileageInterface>(
    '/',
    {
      schema: Mileage.registerMileageSchema,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      try {
        const result = await mileageService.registerMileage(
          { storeid: Number(request.headers.storeid) },
          request.body
        );
        reply.code(200).send(result);
      } catch (e) {
        return reply.code(401).send();
      }
    }
  );

  server.patch<Mileage.saveMileageInterface>(
    '/',
    {
      schema: Mileage.saveMileageSchema,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      try {
        const result = await mileageService.saveMileage(request.body);
        reply.code(200).send(result);
      } catch (e) {
        return reply.code(401).send();
      }
    }
  );
};

export default api;
