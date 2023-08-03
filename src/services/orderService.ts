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
                    createMany: {
                        data: menus.map(menu => {
                            return {
                                count: menu.count,
                                menuId: menu.id
                            }
                        })
                    }
                },
                mileageId: mileageId,
            }
        });
        return {orderId: order.id};
    }

}
