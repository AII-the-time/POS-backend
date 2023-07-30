import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { MenuList } from "../DTO/menu.dto";

const prisma = new PrismaClient();

export default {
    async getMenus(storeId:number): Promise<MenuList>{
        const categories = await prisma.category.findMany({
            where: {
                storeId: storeId
            },
            include: {
                menu: {
                    orderBy: {
                        sort: 'asc'
                    }
                }
            },
            orderBy: {
                sort: 'asc'
            }
        });

        return new MenuList(categories);
    }
}
