import { PreOrder as prismaPreOrder } from '@prisma/client';
import {
  StoreAuthorizationHeader,
  errorSchema,
  SchemaToInterfase,
} from '@DTO/index.dto';
import exp from 'constants';
export type PreOrder = prismaPreOrder;

export const newPreOrderSchema = {
  tags: ['preorder'],
  summary: '새로운 예약 주문 등록',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['totalPrice', 'menus', 'reservationDateTime'],
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
      reservationDateTime: {
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
    401: errorSchema('토큰이 만료되었습니다.'),
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
        'createdAt',
        'preOrderitems',
        'reservationDateTime',
      ],
      properties: {
        totalPrice: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        reservationDateTime: { type: 'string', format: 'date-time' },
        preOrderitems: {
          type: 'array',
          required: ['count', 'price', 'menuName', 'options'],
          properties: {
            count: { type: 'number' },
            price: { type: 'string' },
            menuName: { type: 'string' },
            detail: { type: 'string', nullable: true },
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
    },
    401: errorSchema('토큰이 만료되었습니다.'),
  },
} as const;

export const getPreOrderListSchema = {
  tags: ['preorder'],
  summary: '예약 주문 내역 리스트 가져오기',
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
      required: ['preOrders'],
      properties: {
        preOrders: {
          type: 'array',
          items: {
            type: 'object',
            required: [
              'preOrderId',
              'totalPrice',
              'createdAt',
              'reservationDateTime',
              'totalCount',
            ],
            properties: {
              preOrderId: { type: 'number' },
              totalPrice: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              reservationDateTime: { type: 'string', format: 'date-time' },
              totalCount: { type: 'number' },
            },
          },
        },
      },
    },
    401: errorSchema('토큰이 만료되었습니다.'),
  },
} as const;

export type newPreOrderInterface = SchemaToInterfase<typeof newPreOrderSchema>;
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
>;
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
>;
