import { FastifyInstance } from "fastify";
import { Menu } from '@prisma/client';

export default {
    async orderMenus({server, storeId, menus}:{server:FastifyInstance, storeId:number,menus:{id:number,count:number}[]}): Promise<any>{
        const menusFromDatabase: Menu[] = await server.prisma.menu.findMany({
            where: {
                id: {
                    in: menus.map((menu) => menu.id)
                }
            }
        });
        if(menus.filter((menu) => menusFromDatabase.find((menuFromDatabase) => menuFromDatabase.id === menu.id) === undefined).length > 0) {
            throw new Error("Menu not found");
        }

        const realMenus: {menuId:number, count:number, price:number}[] = menus.map((menu) => {
            return {
                menuId: menu.id,
                count: menu.count,
                price: Number(menusFromDatabase.find((menuFromDatabase) => menuFromDatabase.id === menu.id)?.price)
            }
        });
        const totalPrice = realMenus.reduce((acc, cur) => acc + cur.price * cur.count, 0);

        const payment = await server.prisma.payment.create({
            data: {
                storeId: storeId,
                paymentMethod: "credit",
                paymentStatus: "paid",
                totalPrice: totalPrice,
                createdAt: new Date(),
                updatedAt: new Date(),
                orderitems: {
                    create: realMenus
                }
            },
            include: {
                orderitems: true
            }
        });
        return payment;
    },
    async getPayments(server: FastifyInstance,storeId:number): Promise<any>{
        if(await server.prisma.store.findFirst({
            where: {
                id: storeId
            }
        }) === null) {
            throw new Error("Store not found");
        }

        const payments = await server.prisma.payment.findMany({
            where: {
                storeId: storeId
            },
            include: {
                orderitems: true
            }
        });
        return payments;
    }
}
