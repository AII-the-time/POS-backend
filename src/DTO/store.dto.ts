import { Store as prismaStore } from '@prisma/client';
import {
  AuthorizationHeader,
  errorSchema,
  StoreAuthorizationHeader,
} from '@DTO/index.dto';
import * as E from '@errors';
import { SchemaToInterface } from 'fastify-schema-to-ts';
export type Store = prismaStore;

export const newStoreSchema = {
  tags: ['store'],
  summary: '새로운 가게 등록',
  headers: AuthorizationHeader,
  body: {
    type: 'object',
    required: ['name', 'address', 'openingHours'],
    properties: {
      name: {
        type: 'string',
      },
      address: {
        type: 'string',
      },
      openingHours: {
        type: 'array',
        items: {
          type: 'object',
          required: ['day', 'open', 'close'],
          properties: {
            day: { type: 'string' },
            open: { type: 'string' },
            close: { type: 'string' },
          },
        },
      },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['storeId'],
      properties: {
        storeId: { type: 'number' },
      },
    },
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export const storeListSchema = {
  tags: ['store'],
  summary: '가게 리스트',
  headers: AuthorizationHeader,
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['stores'],
      properties: {
        stores: {
          type: 'array',
          items: {
            type: 'object',
            required: ['storeId', 'name', 'address'],
            properties: {
              storeId: { type: 'number' },
              name: { type: 'string' },
              address: { type: 'string' },
            },
          },
        },
      },
    },
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export const updateStoreSchema = {
  tags: ['store'],
  summary: '가게 정보 수정',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['name', 'address', 'openingHours'],
    properties: {
      name: {
        type: 'string',
      },
      address: {
        type: 'string',
      },
      openingHours: {
        type: 'array',
        items: {
          type: 'object',
          required: ['day', 'open', 'close'],
          properties: {
            day: { type: 'string' },
            open: { type: 'string' },
            close: { type: 'string' },
          },
        },
      },
    },
  },
  response: {
    201: {
      type: 'object',
      description: 'success response',
      required: ['storeId'],
      properties: {
        storeId: { type: 'number' },
      },
    },
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export type newStoreInterface = SchemaToInterface<typeof newStoreSchema> & {
  Body: { userId: number };
};
export type storeListInterface = SchemaToInterface<typeof storeListSchema> & {
  Body: { userId: number };
};
export type updateStoreInterface = SchemaToInterface<
  typeof updateStoreSchema
> & {
  Body: { userId: number; storeId: number };
};
