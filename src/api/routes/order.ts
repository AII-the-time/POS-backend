import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import orderService from '@services/orderService';
import onError from '@hooks/onError';
import * as Order from '@DTO/order.dto';
import checkStoreIdUser from '@hooks/checkStoreIdUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<Order.newOrderInterface>(
    '/',
    {
      schema: Order.newOrderSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await orderService.order(request.body);
      reply.code(200).send(result);
    }
  );

  server.post<Order.payInterface>(
    '/pay',
    {
      schema: Order.paySchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      await orderService.pay(request.body);
      reply.code(200).send();
    }
  );

  server.get<Order.getOrderInterface>(
    '/:orderId',
    {
      schema: Order.getOrderSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await orderService.getOrder(request.body, request.params);
      reply.code(200).send(result);
    }
  );

  server.put<Order.softDeletePayInterface>(
    '/:orderId',
    {
      schema: Order.softDeletePaySchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      await orderService.softDeletePay(request.body, request.params);
      reply.code(204).send();
    }
  );

  server.get<Order.getOrderListInterface>(
    '/',
    {
      schema: Order.getOrderListSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await orderService.getOrderList(
        request.body,
        request.query
      );
      reply.code(200).send(result);
    }
  );
};

export default api;
