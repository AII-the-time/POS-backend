import { PrismaClient } from "@prisma/client";
import { StoreAuthorizationHeader } from "@DTO/index.dto";
import { LoginToken } from "@utils/jwt";
import * as Order from "@DTO/order.dto";
const prisma = new PrismaClient();

export default {
    async order({authorization, storeid}: Order.newOrderInterface['Headers'], {menus, totalPrice, mileageId}: Order.newOrderInterface['Body']): Promise<Order.newOrderInterface['Reply']['200']> {
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }

        const order = await prisma.order.create({
            data: {
                storeId: Number(storeid),
                paymentStatus: "WAITING",
                totalPrice: totalPrice,
                orderitems: {
                    create: menus.map(menu => {
                            return {
                                count: menu.count,
                                menuId: menu.id,
                                optionOrderItems: {
                                    create: menu.options.map(option => {
                                            return {
                                                optionId: option
                                            }
                                        })
                                }
                            }
                        })
                },
                mileageId: mileageId,
            }
        });
        return {orderId: order.id};
    },
    async pay({authorization, storeid}: Order.payInterface['Headers'], {orderId, paymentMethod, price}: Order.payInterface['Body']): Promise<Order.payInterface['Reply']['200']> {
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }

        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            },
            include: {
                payment: true
            }
        });
        if(order === null){
            throw new Error("주문이 존재하지 않습니다.");
        }
        if(order.paymentStatus !== "WAITING"){
            throw new Error("이미 결제된 주문입니다.");
        }

        if(paymentMethod === "MILEAGE"){
            const mileage = await prisma.mileage.findUnique({
                where: {
                    id: order.mileageId
                }
            });
            if(mileage === null){
                throw new Error("마일리지가 존재하지 않습니다.");
            }
            if(mileage.storeId !== Number(storeid)){
                throw new Error("마일리지가 존재하지 않습니다.");
            }
            if(mileage.mileage < price){
                throw new Error("마일리지가 부족합니다.");
            }
            await prisma.mileage.update({
                where: {
                    id: mileage.id
                },
                data: {
                    mileage: mileage.mileage - price
                }
            });
        }

        const paidPrice = order.payment.reduce((acc, cur) => {
            return acc + cur.price;
        }, 0);
        if(paidPrice + price > order.totalPrice){
            throw new Error("결제 금액이 주문 금액을 초과합니다.");
        }

        await prisma.payment.create({
            data: {
                orderId: orderId,
                paymentMethod: paymentMethod,
                price: price
            }
        });

        if(paidPrice + price === order.totalPrice){
            await prisma.order.update({
                where: {
                    id: orderId
                },
                data: {
                    paymentStatus: "PAID"
                }
            });
        }

        return {leftPrice: order.totalPrice - paidPrice - price};
    },

    async getOrder({authorization, storeid}: Order.getOrderInterface['Headers'], {orderId}: Order.getOrderInterface['Params']): Promise<Order.getOrderInterface['Reply']['200']> {
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }

        const order = await prisma.order.findUnique({
            where: {
                id: Number(orderId)
            },
            include: {
                orderitems: {
                    include: {
                        menu: true,
                        optionOrderItems: {
                            include: {
                                option: true
                            }
                        }
                    }
                },
                payment: true
            }
        });
        if(order === null){
            throw new Error("주문이 존재하지 않습니다.");
        }
        if(order.storeId !== Number(storeid)){
            throw new Error("주문이 존재하지 않습니다.");
        }

        const paymentStatus = order.paymentStatus as "WAITING" | "PAID" | "CANCELED";
        const totalPrice = order.totalPrice;
        const createdAt = order.createdAt;
        const orderitems = order.orderitems.map(orderitem => {
            return {
                count: orderitem.count,
                price: orderitem.menu.price,
                menuId: orderitem.menuId,
                options: orderitem.optionOrderItems.map(optionOrderItem => optionOrderItem.optionId)
            }
        });
        const pay = order.payment.map(payment => {
            return {
                paymentMethod: payment.paymentMethod as "CARD" | "CASH" | "MILEAGE" | "BANK",
                price: payment.price,
                paidAt: payment.createdAt
            }
        });

        return {paymentStatus, totalPrice, createdAt, orderitems, pay};

    },
    async getOrderList({authorization, storeid}: Order.getOrderListInterface['Headers'], {page, count}: Order.getOrderListInterface['Querystring']): Promise<Order.getOrderListInterface['Reply']['200']> {
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }
        page = Number(page || 1);
        count = Number(count || 10);
        const orders = await prisma.order.findMany({
            where: {
                storeId: Number(storeid)
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: (page - 1) * count,
            take: count,
            include: {
                payment: true
            }
        });
        const list = orders.map(order => {
            const paymentStatus = order.paymentStatus as "WAITING" | "PAID" | "CANCELED";
            const totalPrice = order.totalPrice;
            const createdAt = order.createdAt;
            const orderId = order.id;
            return {paymentStatus, totalPrice, createdAt, orderId};
        });
        return {orders:list};
    }
}
