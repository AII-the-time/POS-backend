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
              categoryId: { type: 'number' },
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
        categoryId: { type: 'number'},
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

export const createCategorySchema = {
  tags: ['menu'],
  summary: '카테고리 생성',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
    },
  },
  response: {
    201: {
      type: 'object',
      description: 'success response',
      required: ['categoryId'],
      properties: {
        categoryId: { type: 'number' },
      },
    },
    ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
  },
} as const;

export const createMenuSchema = {
  tags: ['menu'],
  summary: '메뉴 생성',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['name', 'price', 'categoryId', 'option', 'recipe'],
    properties: {
      name: { type: 'string' },
      price: { type: 'number' },
      categoryId: { type: 'number' },
      option: {
        type: 'array',
        items: {
          type: 'number'
        },
      },
      recipe: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'amount', 'unit'],
          properties: {
            id: { type: 'number' },
            amount: { type: 'number' },
            unit: { type: 'string' },
          },
        },
      },
    },
  },
  response: {
    201: {
      type: 'object',
      description: 'success response',
      required: ['menuId'],
      properties: {
        menuId: { type: 'number' },
      },
    },
    ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
  },
} as const;

export type getMenuListInterface = SchemaToInterfase<typeof getMenuListSchema>&{Body: {storeId: number, userId: number}};
export type getMenuInterface = SchemaToInterfase<typeof getMenuSchema>&{Body: {storeId: number, userId: number}};
export type createCategoryInterface = SchemaToInterfase<typeof createCategorySchema>&{Body: {storeId: number, userId: number}};
export type createMenuInterface = SchemaToInterfase<typeof createMenuSchema>&{Body: {storeId: number, userId: number}};
