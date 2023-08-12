import { PrismaClient } from "@prisma/client";
import { StoreAuthorizationHeader } from "../DTO/index.dto";
import { LoginToken } from "../utils/jwt";
import * as Order from "../DTO/order.dto";
const prisma = new PrismaClient();

export default {
    async order({authorization, storeid}: StoreAuthorizationHeader, {totalPrice,mileageId, menus }: Order.requestOrder ): Promise<Order.responseOrder> {
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
    async pay({authorization, storeid}: StoreAuthorizationHeader, {orderId, paymentMethod, price}: Order.requestPay): Promise<Order.responsePay> {
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
    }

}
