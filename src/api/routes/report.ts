import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import onError from '@hooks/onError';
import checkStoreIdUser from '@hooks/checkStoreIdUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get(
    '/',
    {
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      reply.code(200).send();
    }
  );
};

export default api;
