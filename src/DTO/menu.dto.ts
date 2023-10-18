import {
  StoreAuthorizationHeader,
  errorSchema,
  SchemaToInterface,
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
            required: ['id', 'isMixed', 'name', 'unit', 'coldRegularAmount', 'coldSizeUpAmount', 'hotRegularAmount', 'hotSizeUpAmount'],
            properties: {
              id: { type: 'number' },
              isMixed: { type: 'boolean' },
              name: { type: 'string' },
              unit: { type: 'string', nullable: true },
              coldRegularAmount: { type: 'number', nullable: true },
              coldSizeUpAmount: { type: 'number', nullable: true },
              hotRegularAmount: { type: 'number', nullable: true },
              hotSizeUpAmount: { type: 'number', nullable: true },
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
    required: ['name', 'price', 'categoryId'],
    properties: {
      name: { type: 'string' },
      price: { type: 'number' },
      categoryId: { type: 'number' },
      option: {
        type: 'array',
        items: {
          type: 'number'
        },
        nullable: true,
      },
      recipe: {
        type: 'array',
        nullable: true,
        items: {
          type: 'object',
          required: ['id', 'isMixed'],
          additionalProperties: false,
          properties: {
            id: { type: 'number' },
            isMixed: { type: 'boolean' },
            unit: { type: 'string', nullable: true },
            coldRegularAmount: { type: 'number', nullable: true },
            coldSizeUpAmount: { type: 'number', nullable: true },
            hotRegularAmount: { type: 'number', nullable: true },
            hotSizeUpAmount: { type: 'number', nullable: true },
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

export const updateMenuSchema = {
  tags: ['menu'],
  summary: '메뉴 생성',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['id', 'name', 'price', 'categoryId'],
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      price: { type: 'number' },
      categoryId: { type: 'number' },
      option: {
        type: 'array',
        items: {
          type: 'number'
        },
        nullable: true,
      },
      recipe: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'isMixed'],
          properties: {
            id: { type: 'number' },
            isMixed: { type: 'boolean' },
            unit: { type: 'string', nullable: true },
            coldRegularAmount: { type: 'number', nullable: true },
            coldSizeUpAmount: { type: 'number', nullable: true },
            hotRegularAmount: { type: 'number', nullable: true },
            hotSizeUpAmount: { type: 'number', nullable: true },
          },
        },
        nullable: true,
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

export const createStockSchema = {
  tags: ['menu'],
  summary: '재료 생성',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      amount: { type: 'number', nullable: true },
      unit: { type: 'string', nullable: true },
      price: { type: 'number', nullable: true },
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
    ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
  },
} as const;

export const updateStockSchema = {
  tags: ['menu'],
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
      price: { type: 'number', nullable: true },
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
    ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
  },
} as const;

export const searchStockSchema = {
  tags: ['menu'],
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
              name: { type: 'string' }
            },
          },
        },
      },
    },
    ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
  },
} as const;

export type getMenuListInterface = SchemaToInterface<typeof getMenuListSchema>&{Body: {storeId: number, userId: number}};
export type getMenuInterface = SchemaToInterface<typeof getMenuSchema>&{Body: {storeId: number, userId: number}};
export type createCategoryInterface = SchemaToInterface<typeof createCategorySchema>&{Body: {storeId: number, userId: number}};
export type createMenuInterface = SchemaToInterface<typeof createMenuSchema>&{Body: {storeId: number, userId: number}};
export type updateMenuInterface = SchemaToInterface<typeof updateMenuSchema>&{Body: {storeId: number, userId: number}};
export type createStockInterface = SchemaToInterface<typeof createStockSchema>&{Body: {storeId: number, userId: number}};
export type updateStockInterface = SchemaToInterface<typeof updateStockSchema>&{Body: {storeId: number, userId: number}};
export type searchStockInterface = SchemaToInterface<typeof searchStockSchema>&{Body: {storeId: number, userId: number}};
