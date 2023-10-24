import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import preOrderService from '@services/preOrderService';
import onError from '@hooks/onError';
import * as PreOrder from '@DTO/preOrder.dto';
import checkStoreIdUser from '@hooks/checkStoreIdUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<PreOrder.newPreOrderInterface>(
    '/',
    {
      schema: PreOrder.newPreOrderSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await preOrderService.preOrder(request.body);
      reply.code(200).send(result);
    }
  );

  server.put<PreOrder.updatePreOrderInterface>(
    '/',
    {
      schema: PreOrder.updatePreOrderSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await preOrderService.updatePreOrder(request.body);
      reply.code(201).send(result);
    }
  );

  server.get<PreOrder.getPreOrderInterface>(
    '/:preOrderId',
    {
      schema: PreOrder.getPreOrderSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await preOrderService.getPreOrder(
        request.body,
        request.params
      );
      reply.code(200).send(result);
    }
  );

  server.put<PreOrder.softDeletePreOrderInterface>(
    '/:preOrderId',
    {
      schema: PreOrder.softDeletePreOrderSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await preOrderService.softDeletePreOrder(
        request.body,
        request.params
      );
      reply.code(204).send(result);
    }
  );

  server.get<PreOrder.getPreOrderListInterface>(
    '/',
    {
      schema: PreOrder.getPreOrderListSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await preOrderService.getPreOrderList(
        request.body,
        request.query
      );
      reply.code(200).send(result);
    }
  );
};

export default api;
