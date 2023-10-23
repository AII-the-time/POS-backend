import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import onError from '@hooks/onError';
import checkStoreIdUser from '@hooks/checkStoreIdUser';
import * as Stock from '@DTO/stock.dto';
import stockService from '@services/stockService';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<Stock.createStockInterface>(
    '/',
    {
      schema: Stock.createStockSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.createStock(request.body);
      reply.code(201).send(result);
    }
  );

  server.put<Stock.updateStockInterface>(
    '/',
    {
      schema: Stock.updateStockSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.updateStock(request.body);
      reply.code(201).send(result);
    }
  );

  server.put<Stock.softDeleteStockInterface>(
    '/:stockId',
    {
      schema: Stock.softDeleteStockSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.softDeleteStock(
        request.body,
        request.params
      );
      reply.code(204).send(result);
    }
  );

  server.get<Stock.getStockListInterface>(
    '/',
    {
      schema: Stock.getStockListSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.getStockList(request.body);
      reply.code(200).send(result);
    }
  );

  server.get<Stock.getStockInterface>(
    '/:stockId',
    {
      schema: Stock.getStockSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.getStock(request.body, request.params);
      reply.code(200).send(result);
    }
  );

  server.post<Stock.createMixedStockInterface>(
    '/mixed',
    {
      schema: Stock.createMixedStockSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.createMixedStock(request.body);
      reply.code(201).send(result);
    }
  );

  server.put<Stock.updateMixedStockInterface>(
    '/mixed',
    {
      schema: Stock.updateMixedStockSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.updateMixedStock(request.body);
      reply.code(201).send(result);
    }
  );

  server.put<Stock.softDeleteMixedStockInterface>(
    '/mixed/:mixedStockId',
    {
      schema: Stock.softDeleteMixedStockSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.softDeleteMixedStock(
        request.body,
        request.params
      );
      reply.code(204).send(result);
    }
  );

  server.get<Stock.getMixedStockListInterface>(
    '/mixed',
    {
      schema: Stock.getMixedStockListSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.getMixedStockList(request.body);
      reply.code(200).send(result);
    }
  );

  server.get<Stock.getMixedStockInterface>(
    '/mixed/:mixedStockId',
    {
      schema: Stock.getMixedStockSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.getMixedStock(
        request.body,
        request.params
      );
      reply.code(200).send(result);
    }
  );

  server.get<Stock.searchStockInterface>(
    '/search',
    {
      schema: Stock.searchStockSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.searchStock(
        request.body,
        request.query
      );
      reply.code(200).send(result);
    }
  );

  server.get<Stock.searchStockAndMixedStockInterface>(
    '/withMixed/search',
    {
      schema: Stock.searchStockAndMixedStockSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await stockService.searchStockAndMixedStock(
        request.body,
        request.query
      );
      reply.code(200).send(result);
    }
  );
};

export default api;
