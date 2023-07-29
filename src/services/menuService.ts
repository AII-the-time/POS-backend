import { FastifyInstance } from "fastify";
import { PrismaClient, Category, Menu } from "@prisma/client";
import { MenuList } from "../DTO/menu.dto";

const prisma = new PrismaClient();

export default {
    async getMenus(storeId:number): Promise<MenuList>{
        const menus = await prisma.category.findMany({
            where: {
                storeId: storeId
            },
            include: {
                menu: true
            },
            orderBy: {
                sort: 'asc'
            }
        });

        const categories: MenuList = {
            categories: menus.map((category) => {
                return {
                    category: category.name,
                    menus: category.menu
                }
            })
        }
        return categories;
    }
}
