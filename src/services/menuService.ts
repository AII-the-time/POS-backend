import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
    async getMenus(storeId:number): Promise<Array<Object>>{
        const menus = await prisma.menu.findMany({
            where: {
                storeId: storeId
            }
        });
        return menus;
    }
}
