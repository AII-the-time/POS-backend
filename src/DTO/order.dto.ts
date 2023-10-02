import { Order as prismaOrder } from '@prisma/client';
import {
  StoreAuthorizationHeader,
  errorSchema,
  SchemaToInterfase,
} from '@DTO/index.dto';
import * as E from '@errors';
export type Order = prismaOrder;

export const newOrderSchema = {
  tags: ['order'],
  summary: '새로운 주문 등록',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['totalPrice', 'menus'],
    properties: {
      totalPrice: {
        type: 'string',
      },
      preOrderId: { type: 'number', nullable: true },
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
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['orderId'],
      properties: {
        orderId: { type: 'number' },
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

export const getOrderSchema = {
  tags: ['order'],
  summary: '주문 내역 가져오기',
  headers: StoreAuthorizationHeader,
  params: {
    type: 'object',
    required: ['orderId'],
    properties: {
      orderId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: [
        'paymentStatus',
        'totalPrice',
        'createdAt',
        'orderitems',
        'pay',
      ],
      properties: {
        paymentStatus: {
          type: 'string',
          enum: ['WAITING', 'PAID', 'FAILED', 'CANCELED'],
        },
        totalPrice: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        orderitems: {
          type: 'array',
          items: {
            type: 'object',
            required: ['count', 'price', 'menuName', 'options'],
            properties: {
              count: { type: 'number' },
              price: { type: 'string' },
              detail: { type: 'string', nullable: true },
              menuName: { type: 'string' },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'price'],
                  properties: {
                    name: { type: 'string' },
                    price: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        mileage: {
          type: 'object',
          required: ['mileageId', 'use', 'save'],
          properties: {
            mileageId: { type: 'number' },
            use: { type: 'string' },
            save: { type: 'string' },
          },
        },
        pay: {
          type: 'object',
          required: ['paymentMethod', 'price'],
          properties: {
            paymentMethod: { type: 'string', enum: ['CARD', 'CASH', 'BANK'] },
            price: { type: 'string' },
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

export const getOrderListSchema = {
  tags: ['order'],
  summary: '주문 내역 리스트 가져오기',
  headers: StoreAuthorizationHeader,
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', default: 1 },
      endPage: { type: 'number', default: 1 },
      count: { type: 'number', default: 10 },
      date: {
        type: 'string',
        format: 'date-time',
        nullable: true,
      },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['orders'],
      properties: {
        orders: {
          type: 'array',
          items: {
            type: 'object',
            required: [
              'orderId',
              'paymentStatus',
              'totalPrice',
              'createdAt',
              'totalCount',
            ],
            properties: {
              orderId: { type: 'number' },
              paymentStatus: {
                type: 'string',
                enum: ['WAITING', 'PAID', 'FAILED', 'CANCELED'],
              },
              paymentMethod: {
                type: 'string',
                enum: ['CARD', 'CASH', 'BANK'],
                nullable: true,
              },
              totalCount: { type: 'number' },
              totalPrice: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
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

export const paySchema = {
  tags: ['order'],
  summary: '결제하기',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['orderId', 'paymentMethod'],
    properties: {
      orderId: { type: 'number' },
      paymentMethod: { type: 'string', enum: ['CARD', 'CASH', 'BANK'] },
      mileageId: { type: 'number', nullable: true },
      useMileage: { type: 'string', nullable: true },
      saveMileage: { type: 'string', nullable: true },
    },
  },
  response: {
    200: {
      type: 'null',
      description: 'success response',
    },
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError,
      E.NotCorrectTypeError,
      E.NotEnoughError
    ),
  },
} as const;

export type newOrderInterface = SchemaToInterfase<typeof newOrderSchema>;
export type getOrderInterface = SchemaToInterfase<
  typeof getOrderSchema,
  [{ pattern: { type: 'string'; format: 'date-time' }; output: Date }]
>;
export type getOrderListInterface = SchemaToInterfase<
  typeof getOrderListSchema,
  [{ pattern: { type: 'string'; format: 'date-time' }; output: Date }]
>;
export type payInterface = SchemaToInterfase<typeof paySchema>;
