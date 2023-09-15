import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import storeService from '@services/storeService';
import * as Store from '@DTO/store.dto';
import checkUser from './hooks/checkUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<Store.newStoreInterface>(
    '/',
    {
      schema: Store.newStoreSchema,
      preValidation: checkUser.checkUser,
    },
    async (request, reply) => {
      try {
        const result = await storeService.newStore(
          { userid: Number(request.headers.userid) },
          request.body
        );
        reply.code(200).send(result);
      } catch (e) {
        return reply.code(401).send();
      }
    }
  );

  server.get<Store.storeListInterface>(
    '/',
    {
      schema: Store.storeListSchema,
      preValidation: checkUser.checkUser,
    },
    async (request, reply) => {
      try {
        const result = await storeService.getStoreList({
          userid: Number(request.headers.userid),
        });
        reply.code(200).send(result);
      } catch (e) {
        return reply.code(401).send();
      }
    }
  );
};

export default api;
