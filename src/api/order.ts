import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import orderService from '@services/orderService';
import { StoreAuthorizationHeader } from '@DTO/index.dto';
import * as Order from '@DTO/order.dto';
import checkUser from './hooks/checkUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<Order.newOrderInterface>(
    '/',
    { schema: Order.newOrderSchema, preValidation: checkUser.checkUser },
    async (request, reply) => {
      try {
        const result = await orderService.order(request.headers, request.body);
        reply.code(200).send(result);
      } catch (e) {
        return reply.code(401).send();
      }
    }
  );

  server.post<Order.payInterface>(
    '/pay',
    { schema: Order.paySchema },
    async (request, reply) => {
      try {
        await orderService.pay(request.headers, request.body);
        reply.code(200).send();
      } catch (e) {
        return reply.code(401).send();
      }
    }
  );

  server.get<Order.getOrderInterface>(
    '/:orderId',
    { schema: Order.getOrderSchema },
    async (request, reply) => {
      try {
        const result = await orderService.getOrder(
          request.headers,
          request.params
        );
        reply.code(200).send(result);
      } catch (e) {
        return reply.code(401).send();
      }
    }
  );

  server.get<Order.getOrderListInterface>(
    '/',
    { schema: Order.getOrderListSchema },
    async (request, reply) => {
      try {
        const result = await orderService.getOrderList(
          request.headers,
          request.query
        );
        reply.code(200).send(result);
      } catch (e: any) {
        console.log(e.message);
        return reply.code(401).send(e.message);
      }
    }
  );
};

export default api;
