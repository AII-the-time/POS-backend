import { PreOrder as prismaPreOrder } from '@prisma/client';
import {
  StoreAuthorizationHeader,
  errorSchema,
  SchemaToInterfase,
} from '@DTO/index.dto';
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
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['preOrderId'],
      properties: {
        orderId: { type: 'number' },
      },
    },
    401: errorSchema('토큰이 만료되었습니다.'),
  },
};
