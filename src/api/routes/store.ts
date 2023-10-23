import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import storeService from '@services/storeService';
import onError from '@hooks/onError';
import * as Store from '@DTO/store.dto';
import checkUser from '@hooks/checkUser';
import checkStoreIdUser from '@hooks/checkStoreIdUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<Store.newStoreInterface>(
    '/',
    {
      schema: Store.newStoreSchema,
      onError,
      preValidation: checkUser,
    },
    async (request, reply) => {
      const result = await storeService.newStore(request.body);
      await storeService.registDefaultOption(result);
      reply.code(200).send(result);
    }
  );

  server.put<Store.updateStoreInterface>(
    '/',
    {
      schema: Store.updateStoreSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await storeService.updateStore(request.body);
      reply.code(201).send(result);
    }
  );

  server.post<Store.newStoreInterface>(
    '/test',
    {
      schema: Store.newStoreSchema,
      onError,
      preValidation: checkUser,
    },
    async (request, reply) => {
      const result = await storeService.newStore(request.body);
      await storeService.registDefaultOption(result);
      await storeService.seeding(result);
      reply.code(200).send(result);
    }
  );

  server.get<Store.storeListInterface>(
    '/',
    {
      schema: Store.storeListSchema,
      onError,
      preValidation: checkUser,
    },
    async (request, reply) => {
      const result = await storeService.getStoreList(request.body);
      reply.code(200).send(result);
    }
  );
};

export default api;
