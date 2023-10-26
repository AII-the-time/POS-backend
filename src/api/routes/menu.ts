import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import onError from '@hooks/onError';
import checkStoreIdUser from '@hooks/checkStoreIdUser';
import * as Menu from '@DTO/menu.dto';
import menuService from '@services/menuService';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get<Menu.getMenuListInterface>(
    '/',
    {
      schema: Menu.getMenuListSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.getMenuList(request.body);
      reply.code(200).send(result);
    }
  );

  server.get<Menu.getMenuInterface>(
    '/:menuId',
    {
      schema: Menu.getMenuSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.getMenu(request.body, request.params);
      reply.code(200).send(result);
    }
  );

  server.post<Menu.createCategoryInterface>(
    '/category',
    {
      schema: Menu.createCategorySchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.createCategory(request.body);
      reply.code(201).send(result);
    }
  );

  server.put<Menu.updateCategoryInterface>(
    '/category',
    {
      schema: Menu.updateCategorySchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.updateCategory(request.body);
      reply.code(201).send(result);
    }
  );

  server.delete<Menu.softDeleteCategoryInterface>(
    '/category/:categoryId',
    {
      schema: Menu.softDeleteCategorySchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.softDeleteCategory(
        request.body,
        request.params
      );
      reply.code(200).send(result);
    }
  );

  server.post<Menu.createMenuInterface>(
    '/',
    {
      schema: Menu.createMenuSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.createMenu(request.body);
      reply.code(201).send(result);
    }
  );

  server.put<Menu.updateMenuInterface>(
    '/',
    {
      schema: Menu.updateMenuSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.updateMenu(request.body);
      reply.code(201).send(result);
    }
  );

  server.delete<Menu.softDeleteMenuInterface>(
    '/:menuId',
    {
      schema: Menu.softDeleteMenuSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.softDeleteMenu(
        request.body,
        request.params
      );
      reply.code(200).send(result);
    }
  );

  server.get<Menu.getOptionListInterface>(
    '/option',
    {
      schema: Menu.getOptionListSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.getOptionList(request.body);
      reply.code(200).send(result);
    }
  );
  server.put<Menu.updateOptionInterface>(
    '/option',
    {
      schema: Menu.updateOptionSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.updateOption(request.body);
      reply.code(201).send(result);
    }
  );
  server.delete<Menu.softDeleteOptionInterface>(
    '/option/:optionId',
    {
      schema: Menu.softDeletOptionSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await menuService.softDeleteOption(
        request.body,
        request.params
      );
      reply.code(200).send(result);
    }
  );
};

export default api;
