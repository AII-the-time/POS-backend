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

export interface requestPay{
    orderId: number;
    paymentMethod: "CARD" | "CASH" | "MILEAGE" | "BANK"; //카드, 현금, 마일리지, 계좌이체
    price: number;
}

export interface responsePay{
    leftPrice: number;
}
