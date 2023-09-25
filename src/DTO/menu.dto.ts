import {
  StoreAuthorizationHeader,
  errorSchema,
  SchemaToInterfase,
} from '@DTO/index.dto';
import * as E from '@errors';

export const getMenuListSchema = {
  tags: ['menu'],
  summary: '메뉴 조회',
  headers: StoreAuthorizationHeader,
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['categories'],
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            required: ['category', 'menus', 'categoryId'],
            properties: {
              category: { type: 'string' },
              categoryId: { type: 'number', nullable: true }, //null: 그룹 미지정
              menus: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'name', 'price'],
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    price: { type: 'string' },
                  }
                }
              }
            }
          }
        }
      },
    },
    ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
  },
} as const;

export const getMenuSchema = {
  tags: ['menu'],
  summary: '각 메뉴 상세 조회',
  headers: StoreAuthorizationHeader,
  params: {
    type: 'object',
    required: ['menuId'],
    properties: {
      menuId: { type: 'number' },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['category', 'categoryId', 'name', 'price', 'option','recipe'],
      properties: {
        category: { type: 'string' },
        categoryId: { type: 'number', nullable: true }, //null: 그룹 미지정
        name: { type: 'string' },
        price: { type: 'string' },
        option: {
          type: 'array',
          items: {
            type: 'object',
            required: ['optionType', 'options'],
            properties: {
              optionType: { type: 'string' },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'name', 'price', 'isSelectable'],
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    price: { type: 'string' },
                    isSelectable: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
        recipe: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'name', 'amount', 'unit'],
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              amount: { type: 'number' },
              unit: { type: 'string' },
            },
          },
        },
      },
    },
    ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
  },
} as const;

export type getMenuListInterface = SchemaToInterfase<typeof getMenuListSchema>;
export type getMenuInterface = SchemaToInterfase<typeof getMenuSchema>;
