import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import storeService from '@services/storeService';
import onError from "@hooks/onError";
import * as Store from '@DTO/store.dto';
import checkUser from '@hooks/checkUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<Store.newStoreInterface>(
    '/',
    {
      schema: Store.newStoreSchema,onError,
      preValidation: checkUser,
    },
    async (request, reply) => {
      const result = await storeService.newStore(
        { userid: Number(request.headers.userid) },
        request.body
      );
      reply.code(200).send(result);
    }
  );

  server.get<Store.storeListInterface>(
    '/',
    {
      schema: Store.storeListSchema,onError,
      preValidation: checkUser,
    },
    async (request, reply) => {
      const result = await storeService.getStoreList({
        userid: Number(request.headers.userid),
      });
      reply.code(200).send(result);
    }
  );
};

export default api;
