import {
  StoreAuthorizationHeader,
  errorSchema,
} from '@DTO/index.dto';
import * as E from '@errors';
import { SchemaToInterface } from 'fastify-schema-to-ts';

export const createStockSchema = {
  tags: ['stock'],
  summary: '재료 생성',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      amount: { type: 'number', nullable: true },
      unit: { type: 'string', nullable: true },
      price: { type: 'string', nullable: true },
      currentAmount: { type: 'number', nullable: true },
      noticeThreshold: { type: 'number' },
    },
  },
  response: {
    201: {
      type: 'object',
      description: 'success response',
      required: ['stockId'],
      properties: {
        stockId: { type: 'number' },
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

export const updateStockSchema = {
  tags: ['stock'],
  summary: '재료 수정',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['id', 'name'],
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      amount: { type: 'number', nullable: true },
      unit: { type: 'string', nullable: true },
      price: { type: 'string', nullable: true },
      currentAmount: { type: 'number', nullable: true },
      noticeThreshold: { type: 'number' },
    },
  },
  response: {
    201: {
      type: 'object',
      description: 'success response',
      required: ['stockId'],
      properties: {
        stockId: { type: 'number' },
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

export const softDeleteStockSchema = {
  tags: ['stock'],
  summary: '재료 삭제',
  headers: StoreAuthorizationHeader,
  params: {
    type: 'object',
    required: ['stockId'],
    properties: {
      stockId: { type: 'number' },
    },
  },
  response: {
    204: {
      type: 'null',
      description: 'success response',
    },
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export const getStockListSchema = {
  tags: ['stock'],
  summary: '원재료 목록 조회',
  headers: StoreAuthorizationHeader,
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['stocks'],
      properties: {
        stocks: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name', 'status', 'usingMenuCount'],
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              status: {
                type: 'string',
                enum: ['EMPTY', 'OUT_OF_STOCK', 'CAUTION', 'ENOUGH', 'UNKNOWN'],
              },
              usingMenuCount: { type: 'number' },
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

export const getStockSchema = {
  tags: ['stock'],
  summary: '원재료 상세 조회',
  headers: StoreAuthorizationHeader,
  params: {
    type: 'object',
    required: ['stockId'],
    properties: {
      stockId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: [
        'name',
        'amount',
        'unit',
        'price',
        'currentAmount',
        'noticeThreshold',
        'updatedAt',
        'history'
      ],
      properties: {
        name: { type: 'string' },
        amount: { type: 'number', nullable: true },
        unit: { type: 'string', nullable: true },
        price: { type: 'string', nullable: true },
        currentAmount: { type: 'number', nullable: true },
        noticeThreshold: { type: 'number' },
        updatedAt: { type: 'string' },
        history: {
          type: 'array',
          items: {
            type: 'object',
            required: ['amount', 'date', 'price'],
            properties: {
              amount: { type: 'number' },
              date: { type: 'string', format: 'date-time' },
              price: { type: 'string' },
            },
          },
        }
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

export const createMixedStockSchema = {
  tags: ['stock'],
  summary: '혼합 재료 생성',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['name', 'mixing'],
    properties: {
      name: { type: 'string' },
      totalAmount: { type: 'number', nullable: true },
      unit: { type: 'string', nullable: true },
      mixing: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'unit', 'amount'],
          additionalProperties: false,
          properties: {
            id: { type: 'number' },
            unit: { type: 'string' },
            amount: { type: 'number' },
          },
        },
      },
    },
  },
  response: {
    201: {
      type: 'object',
      description: 'success response',
      required: ['mixedStockId'],
      properties: {
        mixedStockId: { type: 'number' },
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

export const updateMixedStockSchema = {
  tags: ['stock'],
  summary: '혼합 재료 생성',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['name', 'mixing', 'id'],
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      totalAmount: { type: 'number', nullable: true },
      unit: { type: 'string', nullable: true },
      mixing: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'unit', 'amount'],
          additionalProperties: false,
          properties: {
            id: { type: 'number' },
            unit: { type: 'string' },
            amount: { type: 'number' },
          },
        },
      },
    },
  },
  response: {
    201: {
      type: 'object',
      description: 'success response',
      required: ['mixedStockId'],
      properties: {
        mixedStockId: { type: 'number' },
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

export const softDeleteMixedStockSchema = {
  tags: ['stock'],
  summary: '혼합 재료 삭제',
  headers: StoreAuthorizationHeader,
  params: {
    type: 'object',
    required: ['mixedStockId'],
    properties: {
      mixedStockId: { type: 'number' },
    },
  },
  response: {
    204: {
      type: 'null',
      description: 'success response',
    },
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export const getMixedStockListSchema = {
  tags: ['stock'],
  summary: '혼합 재료 목록 조회',
  headers: StoreAuthorizationHeader,
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['mixedStocks'],
      properties: {
        mixedStocks: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
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

export const getMixedStockSchema = {
  tags: ['stock'],
  summary: '혼합 재료 상세 조회',
  headers: StoreAuthorizationHeader,
  params: {
    type: 'object',
    required: ['mixedStockId'],
    properties: {
      mixedStockId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['name', 'totalAmount', 'unit', 'mixing'],
      properties: {
        name: { type: 'string' },
        totalAmount: { type: 'number', nullable: true },
        unit: { type: 'string', nullable: true },
        mixing: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name', 'unit', 'amount'],
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              unit: { type: 'string', nullable: true },
              amount: { type: 'number' },
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

export const searchStockSchema = {
  tags: ['stock'],
  summary: '재료 검색',
  headers: StoreAuthorizationHeader,
  querystring: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['stocks'],
      properties: {
        stocks: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
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

export const searchStockAndMixedStockSchema = {
  tags: ['stock'],
  summary: '재료 검색',
  headers: StoreAuthorizationHeader,
  querystring: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['stocks'],
      properties: {
        stocks: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name', 'isMixed'],
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              isMixed: { type: 'boolean' },
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

export type createStockInterface = SchemaToInterface<
  typeof createStockSchema
> & { Body: { storeId: number; userId: number } };
export type updateStockInterface = SchemaToInterface<
  typeof updateStockSchema
> & { Body: { storeId: number; userId: number } };
export type softDeleteStockInterface = SchemaToInterface<
  typeof softDeleteStockSchema
> & { Body: { storeId: number; userId: number; stockId: number } };
export type getStockListInterface = SchemaToInterface<
  typeof getStockListSchema
> & { Body: { storeId: number; userId: number } };
export type getStockInterface = SchemaToInterface<
  typeof getStockSchema,
  [{ pattern: { type: 'string'; format: 'date-time' }; output: Date }]
> & {
  Body: { storeId: number; userId: number };
};
export type createMixedStockInterface = SchemaToInterface<
  typeof createMixedStockSchema
> & { Body: { storeId: number; userId: number } };
export type updateMixedStockInterface = SchemaToInterface<
  typeof updateMixedStockSchema
> & { Body: { storeId: number; userId: number } };
export type softDeleteMixedStockInterface = SchemaToInterface<
  typeof softDeleteMixedStockSchema
> & { Body: { storeId: number; userId: number; mixedStockId: number } };
export type getMixedStockListInterface = SchemaToInterface<
  typeof getMixedStockListSchema
> & { Body: { storeId: number; userId: number } };
export type getMixedStockInterface = SchemaToInterface<
  typeof getMixedStockSchema
> & { Body: { storeId: number; userId: number } };
export type searchStockInterface = SchemaToInterface<
  typeof searchStockSchema
> & { Body: { storeId: number; userId: number } };
export type searchStockAndMixedStockInterface = SchemaToInterface<
  typeof searchStockAndMixedStockSchema
> & { Body: { storeId: number; userId: number } };
