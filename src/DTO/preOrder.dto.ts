import { PreOrder as prismaPreOrder } from '@prisma/client';
import {
  StoreAuthorizationHeader,
  errorSchema,
  SchemaToInterfase,
} from '@DTO/index.dto';
import * as E from '@errors';
export type PreOrder = prismaPreOrder;

export const newPreOrderSchema = {
  tags: ['preorder'],
  summary: '새로운 예약 주문 등록',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['totalPrice', 'phone', 'menus', 'orderedFor'],
    properties: {
      totalPrice: {
        type: 'string',
      },
      menus: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'count', 'options'],
          properties: {
            id: { type: 'number' },
            count: { type: 'number' },
            detail: { type: 'string', nullable: true },
            options: {
              type: 'array',
              items: { type: 'number' },
            },
          },
        },
      },
      phone: { type: 'string' },
      memo: { type: 'string', nullable: true },
      orderedFor: {
        type: 'string',
        format: 'date-time',
      },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['preOrderId'],
      properties: {
        preOrderId: { type: 'number' },
      },
    },
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError,
      E.NotCorrectTypeError
    ),
  },
} as const;

export const getPreOrderSchema = {
  tags: ['preorder'],
  summary: '예약 주문 내역 가져오기',
  headers: StoreAuthorizationHeader,
  params: {
    type: 'object',
    required: ['preOrderId'],
    properties: {
      preOrderId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: [
        'totalPrice',
        'totalCount',
        'createdAt',
        'orderedFor',
        'phone',
        'orderitems',
      ],
      properties: {
        totalPrice: { type: 'string' },
        totalCount: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time' },
        orderedFor: { type: 'string', format: 'date-time' },
        phone: { type: 'string' },
        memo: { type: 'string', nullable: true },
        orderitems: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'count', 'price', 'menuName', 'options'],
            properties: {
              id: { type: 'number' },
              count: { type: 'number' },
              price: { type: 'string' },
              menuName: { type: 'string' },
              detail: { type: 'string', nullable: true },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'name', 'price'],
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    price: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError,
      E.NotCorrectTypeError
    ),
  },
} as const;

export const getPreOrderListSchema = {
  tags: ['preorder'],
  summary: '예약 주문 내역 리스트 가져오기',
  headers: StoreAuthorizationHeader,
  querystring: {
    type: 'object',
    required: ['page', 'count', 'date'],
    properties: {
      page: { type: 'number', default: 1 },
      count: { type: 'number', default: 10 },
      date: {
        type: 'string',
        format: 'date-time',
        default: new Date().toISOString(),
      },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['preOrders', 'lastPage', 'totalPreOrderCount'],
      properties: {
        lastPage: { type: 'number' },
        totalPreOrderCount: { type: 'number' },
        preOrders: {
          type: 'array',
          items: {
            type: 'object',
            required: [
              'preOrderId',
              'totalCount',
              'totalPrice',
              'phone',
              'orderedFor',
              'createdAt',
            ],
            properties: {
              preOrderId: { type: 'number' },
              totalPrice: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              totalCount: { type: 'number' },
              phone: { type: 'string' },
              memo: { type: 'string', nullable: true },
              orderedFor: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError,
      E.NotCorrectTypeError
    ),
  },
} as const;

export type newPreOrderInterface = SchemaToInterfase<typeof newPreOrderSchema>&{Body: {storeId: number, userId: number}};
export type getPreOrderInterface = SchemaToInterfase<
  typeof getPreOrderSchema,
  [
    {
      pattern: {
        type: 'string';
        format: 'date-time';
      };
      output: Date;
    }
  ]
>&{Body: {storeId: number, userId: number}};
export type getPreOrderListInterface = SchemaToInterfase<
  typeof getPreOrderListSchema,
  [
    {
      pattern: {
        type: 'string';
        format: 'date-time';
      };
      output: Date;
    }
  ]
>&{Body: {storeId: number, userId: number}};
