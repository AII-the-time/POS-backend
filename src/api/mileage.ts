import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import mileageService from '@services/mileageService';
import { StoreAuthorizationHeader } from '@DTO/index.dto';
import * as Mileage from '@DTO/mileage.dto';
import checkStoreIdUser from './hooks/checkStoreIdUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get<Mileage.getMileageInterface>(
    '/',
    {
      schema: Mileage.getMileageSchema,
      preValidation: checkStoreIdUser.checkStoreIdUser,
    },
    async (request, reply) => {
      try {
        const result = await mileageService.getMileage(
          { storeid: Number(request.headers.storeid) },
          request.query
        );
        reply.code(200).send(result);
      } catch (e) {
        return reply.code(404).send();
      }
    }
  );

  server.post<Mileage.registerMileageInterface>(
    '/',
    {
      schema: Mileage.registerMileageSchema,
      preValidation: checkStoreIdUser.checkStoreIdUser,
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
      preValidation: checkStoreIdUser.checkStoreIdUser,
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
