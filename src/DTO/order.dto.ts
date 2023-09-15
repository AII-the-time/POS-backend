import { Order as prismaOrder } from '@prisma/client';
import { StoreAuthorizationHeader, errorSchema, SchemaToInterfase } from '@DTO/index.dto';
export type Order = prismaOrder;

export const newOrderSchema ={
    tags: ['order'],
    summary: '새로운 주문 등록',
    headers: StoreAuthorizationHeader,
    body: {
        type: 'object',
        required: ['totalPrice','menus'],
        properties: {
            totalPrice: {
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
                        detail: { type: 'string', nullable: true },
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
                paymentStatus: { type: 'string', enum: ["WAITING", "PAID", "FAILED", "CANCELED"] },
                totalPrice: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                orderitems: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['count','price','menuName','options','detail'],
                        properties: {
                            count: { type: 'number' },
                            price: { type: 'number' },
                            detail: { type: 'string' },
                            menuName: { type: 'string' },
                            options: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    required: ['name','price'],
                                    properties: {
                                        name: { type: 'string' },
                                        price: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                },
                mileage: {
                    type: 'object',
                    required: ['mileageId','use','save',],
                    properties: {
                        mileageId: { type: 'number' },
                        use: { type: 'number' },
                        save: { type: 'number' }
                    }
                },
                pay: {
                    type: 'object',
                    required: ['paymentMethod','price'],
                    properties: {
                        paymentMethod: { type: 'string', enum: ["CARD", "CASH", "BANK"] },
                        price: { type: 'number' }
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
                        required: ['orderId','paymentStatus','paymentMethod','totalPrice','createdAt','totalCount'],
                        properties: {
                            orderId: { type: 'number' },
                            paymentStatus: { type: 'string' , enum: ["WAITING", "PAID", "FAILED", "CANCELED"] },
                            paymentMethod: { type: 'string' , enum: ["CARD", "CASH", "BANK"] },
                            totalCount: { type: 'number' },
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
        required: ['orderId','paymentMethod'],
        properties: {
            orderId: { type: 'number' },
            paymentMethod: { type: 'string',enum: ["CARD", "CASH", "BANK"] },
            mileageId: { type: 'number', nullable: true },
            useMileage: { type: 'number', nullable: true },
            saveMileage: { type: 'number', nullable: true }
        }
    },
    response: {
        200: {
            type: 'null',
            description: 'success response',
        },
        401: errorSchema('토큰이 만료되었습니다.')
    }
} as const;

export type newOrderInterface = SchemaToInterfase<typeof newOrderSchema>;
export type getOrderInterface = SchemaToInterfase<typeof getOrderSchema, [{pattern: {type: 'string'; format: 'date-time'}; output: Date }]>;
export type getOrderListInterface = SchemaToInterfase<typeof getOrderListSchema, [{pattern: {type: 'string'; format: 'date-time'}; output: Date }]>;
export type payInterface = SchemaToInterfase<typeof paySchema>;
