import { Order as prismaOrder } from '@prisma/client';
import { StoreAuthorizationHeader, errorSchema, SchemaToInterfase } from '@DTO/index.dto';
export type Order = prismaOrder;

export const newOrderSchema ={
    tags: ['order'],
    summary: '새로운 주문 등록',
    headers: StoreAuthorizationHeader,
    body: {
        type: 'object',
        required: ['totalPrice','mileageId','menus'],
        properties: {
            totalPrice: {
                type: 'number',
            },
            mileageId: {
                type: 'number',
            },
            menus: {
                type: 'array',
                items: {
                    type: 'object',
                    required: ['id','count','options'],
                    properties: {
                        id: { type: 'number' },
                        count: { type: 'number' },
                        options: {
                            type: 'array',
                            items: { type: 'number' }
                        }
                    }
                }
            }
        }
    },
    response: {
        200: {
            type: 'object',
            description: 'success response',
            required: ['orderId'],
            properties: {
                orderId: { type: 'number' }
            }
        },
        401: errorSchema('토큰이 만료되었습니다.')
    }
} as const;

export const getOrderSchema = {
    tags: ['order'],
    summary: '주문 내역 가져오기',
    headers: StoreAuthorizationHeader,
    params: {
        type: 'object',
        required: ['orderId'],
        properties: {
            orderId: { type: 'string' },
        }
    },
    response: {
        200: {
            type: 'object',
            description: 'success response',
            required: ['paymentStatus','totalPrice','createdAt','orderitems','pay'],
            properties: {
                paymentStatus: { type: 'string' },
                totalPrice: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                orderitems: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['count','price','menuId','options'],
                        properties: {
                            count: { type: 'number' },
                            price: { type: 'number' },
                            menuId: { type: 'number' },
                            options: {
                                type: 'array',
                                items: { type: 'number' }
                            }
                        }
                    }
                },
                pay: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['paymentMethod','price','paidAt'],
                        properties: {
                            paymentMethod: { type: 'string' },
                            price: { type: 'number' },
                            paidAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        },
        401: errorSchema('토큰이 만료되었습니다.')
    }
} as const;

export const getOrderListSchema = {
    tags: ['order'],
    summary: '주문 내역 리스트 가져오기',
    headers: StoreAuthorizationHeader,
    querystring: {
        type: 'object',
        required: ['page','count'],
        properties: {
            page: { type: 'number' },
            count: { type: 'number' }
        }
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
                        required: ['orderId','paymentStatus','totalPrice','createdAt'],
                        properties: {
                            orderId: { type: 'number' },
                            paymentStatus: { type: 'string' },
                            totalPrice: { type: 'number' },
                            createdAt: { type: 'string', format: 'date-time' }
                        }
                    }
                }
            }
        },
        401: errorSchema('토큰이 만료되었습니다.')
    }
} as const;

export const paySchema = {
    tags: ['order'],
    summary: '결제하기',
    headers: StoreAuthorizationHeader,
    body: {
        type: 'object',
        required: ['orderId','paymentMethod','price'],
        properties: {
            orderId: { type: 'number' },
            paymentMethod: { type: 'string' },
            price: { type: 'number' }
        }
    },
    response: {
        200: {
            type: 'object',
            description: 'success response',
            required: ['leftPrice'],
            properties: {
                leftPrice: { type: 'number' }
            }
        },
        401: errorSchema('토큰이 만료되었습니다.')
    }
} as const;

export type newOrderInterface = SchemaToInterfase<typeof newOrderSchema>;
export type getOrderInterface = SchemaToInterfase<typeof getOrderSchema>;
export type getOrderListInterface = SchemaToInterfase<typeof getOrderListSchema>;
export type payInterface = SchemaToInterfase<typeof paySchema>;
