import { FastifyInstance } from "fastify";
import { Menu } from '@prisma/client';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
    async orderMenus({storeId, menus}:{storeId:number,menus:{id:number,count:number}[]}): Promise<any>{
        const menusFromDatabase: Menu[] = await prisma.menu.findMany({
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

        const payment = await prisma.payment.create({
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
    async getPayments(storeId:number): Promise<any>{
        if(await prisma.store.findFirst({
            where: {
                id: storeId
            }
        }) === null) {
            throw new Error("Store not found");
        }

        const payments = await prisma.payment.findMany({
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
