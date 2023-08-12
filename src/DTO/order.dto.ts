import { Order as prismaOrder } from '@prisma/client';
export type Order = prismaOrder;

export interface requestNewOrder{
    totalPrice: number;
    mileageId: number;
    menus: Array<{
        id: number;
        count: number;
        options: number[];
    }>;
}

export interface responseNewOrder{
    orderId: number;
}

export interface requestGetOrder{
    orderId: number;
}

export interface responseGetOrder{
    paymentStatus: "WAITING" | "PAID" | "CANCELED";
    totalPrice: number;
    createdAt: Date;
    orderitems: Array<
        {
            count: number;
            price: number;
            menuId: number;
            options: number[];
        }>;
    pay: Array<{
        paymentMethod: "CARD" | "CASH" | "MILEAGE" | "BANK"; //카드, 현금, 마일리지, 계좌이체
        price: number;
        paidAt: Date;
    }>;
}

export interface requestGetOrderList{
    page: number;
    count: number;
}

export interface responseGetOrderList {
    orders: Array<{
        orderId: number;
        paymentStatus: "WAITING" | "PAID" | "CANCELED";
        totalPrice: number;
        createdAt: Date;
    }>;
}

export interface requestPay{
    orderId: number;
    paymentMethod: "CARD" | "CASH" | "MILEAGE" | "BANK"; //카드, 현금, 마일리지, 계좌이체
    price: number;
}

export interface responsePay{
    leftPrice: number;
}
