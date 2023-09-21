import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import orderService from '@services/orderService';
import onError from "@hooks/onError";
import * as Order from '@DTO/order.dto';
import checkStoreIdUser from '@hooks/checkStoreIdUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<Order.newOrderInterface>(
    '/',
    {
      schema: Order.newOrderSchema,onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await orderService.order(
        { storeid: Number(request.headers.storeid) },
        request.body
      );
      reply.code(200).send(result);
    }
  );

  server.post<Order.payInterface>(
    '/pay',
    {
      schema: Order.paySchema,onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      await orderService.pay(
        { storeid: Number(request.headers.storeid) },
        request.body
      );
      reply.code(200).send();
    }
  );

  server.get<Order.getOrderInterface>(
    '/:orderId',
    {
      schema: Order.getOrderSchema,onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await orderService.getOrder(
        { storeid: Number(request.headers.storeid) },
        request.params
      );
      reply.code(200).send(result);
    }
  );

  server.get<Order.getOrderListInterface>(
    '/',
    {
      schema: Order.getOrderListSchema,onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
        const result = await orderService.getOrderList(
          { storeid: Number(request.headers.storeid) },
          request.query
        );
        reply.code(200).send(result);
    }
  );
};

export default api;
