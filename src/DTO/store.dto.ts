import { Store as prismaStore } from '@prisma/client';
import { AuthorizationHeader, errorSchema, SchemaToInterfase } from '@DTO/index.dto';
import * as E from '@errors';
export type Store = prismaStore;

export const newStoreSchema ={
    tags: ['store'],
    summary: '새로운 가게 등록',
    headers: AuthorizationHeader,
    body: {
        type: 'object',
        required: ['name','address','openingHours'],
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
                    required: ['day','open','close'],
                    properties: {
                        day: { type: 'string' },
                        open: { type: 'string' },
                        close: { type: 'string' }
                    }
                }
            }
        }
    },
    response: {
        200: {
            type: 'object',
            description: 'success response',
            required: ['storeId'],
            properties: {
                storeId: { type: 'number' }
            }
        },
        ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
    }
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
                        required: ['storeId','name','address'],
                        properties: {
                            storeId: { type: 'number' },
                            name: { type: 'string' },
                            address: { type: 'string' }
                        }
                    }
                }
            }
        },
        ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
    }
} as const;

export type newStoreInterface = SchemaToInterfase<typeof newStoreSchema>;
export type storeListInterface = SchemaToInterfase<typeof storeListSchema>;
