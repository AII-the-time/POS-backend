import {
  StoreAuthorizationHeader,
  errorSchema,
} from '@DTO/index.dto';
import * as E from '@errors';
import { SchemaToInterface } from 'fastify-schema-to-ts';

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
                  required: ['id', 'name', 'price','stockStatus'],
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    price: { type: 'string' },
                    stockStatus: {
                      type: 'string',
                      enum: ['EMPTY', 'OUT_OF_STOCK', 'CAUTION', 'ENOUGH', 'UNKNOWN'],
                      default: 'UNKNOWN',
                    },
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
      E.NoAuthorizationInHeaderError
    ),
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
      required: ['category', 'categoryId', 'name', 'price', 'option', 'recipe'],
      properties: {
        category: { type: 'string' },
        categoryId: { type: 'number' },
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
            required: [
              'id',
              'isMixed',
              'name',
              'unit',
              'coldRegularAmount',
              'coldSizeUpAmount',
              'hotRegularAmount',
              'hotSizeUpAmount',
            ],
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
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export const getOptionListSchema = {
  tags: ['menu'],
  summary: '모든 옵션 조회',
  headers: StoreAuthorizationHeader,
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['option'],
      properties: {
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
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export const updateOptionSchema = {
  tags: ['menu'],
  summary: '옵션 수정',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['optionName', 'optionPrice', 'optionCategory', 'optionId'],
    properties: {
      optionId: { type: 'number' },
      optionName: { type: 'string' },
      optionPrice: { type: 'number' },
      optionCategory: { type: 'string' },
    },
  },
  response: {
    201: {
      type: 'object',
      description: 'success response',
      required: ['optionId'],
      properties: {
        optionId: { type: 'number' },
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
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export const updateCategorySchema = {
  tags: ['menu'],
  summary: '카테고리 이름 수정',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['id', 'name'],
    properties: {
      id: { type: 'number' },
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
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError,
      E.NotCorrectTypeError
    ),
  },
} as const;

export const softDeleteCategorySchema = {
  tags: ['menu'],
  summary: '카테고리 삭제',
  headers: StoreAuthorizationHeader,
  params: {
    type: 'object',
    required: ['categoryId'],
    properties: {
      categoryId: { type: 'number' },
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

export const createMenuSchema = {
  tags: ['menu'],
  summary: '메뉴 생성',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['name', 'price', 'categoryId'],
    properties: {
      name: { type: 'string' },
      price: { type: 'string' },
      categoryId: { type: 'number' },
      option: {
        type: 'array',
        items: {
          type: 'number',
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
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export const updateMenuSchema = {
  tags: ['menu'],
  summary: '메뉴 수정',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['id', 'name', 'price', 'categoryId'],
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      price: { type: 'string' },
      categoryId: { type: 'number' },
      option: {
        type: 'array',
        items: {
          type: 'number',
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
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export const softDeleteMenuSchema = {
  tags: ['menu'],
  summary: '메뉴 삭제',
  headers: StoreAuthorizationHeader,
  params: {
    type: 'object',
    required: ['menuId'],
    properties: {
      menuId: { type: 'number' },
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

export const softDeletOptionSchema = {
  tags: ['menu'],
  summary: '옵션 삭제',
  headers: StoreAuthorizationHeader,
  params: {
    type: 'object',
    required: ['optionId'],
    properties: {
      optionId: { type: 'number' },
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

export type getMenuListInterface = SchemaToInterface<
  typeof getMenuListSchema
> & { Body: { storeId: number; userId: number } };
export type getMenuInterface = SchemaToInterface<typeof getMenuSchema> & {
  Body: { storeId: number; userId: number };
};
export type getOptionListInterface = SchemaToInterface<
  typeof getOptionListSchema
> & { Body: { storeId: number; userId: number } };
export type updateOptionInterface = SchemaToInterface<
  typeof updateOptionSchema
> & { Body: { storeId: number; userId: number } };
export type createCategoryInterface = SchemaToInterface<
  typeof createCategorySchema
> & { Body: { storeId: number; userId: number } };
export type updateCategoryInterface = SchemaToInterface<
  typeof updateCategorySchema
> & { Body: { storeId: number; userId: number } };
export type softDeleteCategoryInterface = SchemaToInterface<
  typeof softDeleteCategorySchema
> & { Body: { storeId: number; userId: number; categoryId: number } };
export type createMenuInterface = SchemaToInterface<typeof createMenuSchema> & {
  Body: { storeId: number; userId: number };
};
export type updateMenuInterface = SchemaToInterface<typeof updateMenuSchema> & {
  Body: { storeId: number; userId: number };
};
export type softDeleteMenuInterface = SchemaToInterface<
  typeof softDeleteMenuSchema
> & {
  Body: { storeId: number; userId: number; menuId: number };
};
export type softDeleteOptionInterface = SchemaToInterface<
  typeof softDeletOptionSchema
> & { Body: { storeId: number; userId: number; optionId: number } };
