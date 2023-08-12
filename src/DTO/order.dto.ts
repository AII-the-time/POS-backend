import { Order as prismaOrder } from '@prisma/client';
export type Order = prismaOrder;

export interface requestOrder{
    totalPrice: number;
    mileageId: number;
    menus: Array<{
        id: number;
        count: number;
        options: number[];
    }>;
}

export interface responseOrder{
    orderId: number;
}
