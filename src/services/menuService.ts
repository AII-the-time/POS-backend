import { PrismaClient } from "@prisma/client";
import { NotFoundError } from '@errors';
import * as Menu from "@DTO/menu.dto";

const prisma = new PrismaClient();

export default {
    async getMenus({storeid}: {storeid:number}): Promise<Menu.getMenuListInterface['Reply']['200']> {
        const categories = await prisma.category.findMany({
            where: {
                storeId: Number(storeid)
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

        const result = categories.map((category) => {
            const menus = category.menu.map(
                (menu) => ({
                    ...menu,
                    price: menu.price.toString(),
                })
            );

            return {
                category: category.name,
                categoryId: category.id,
                menus
            }
        })
        return {categories: result};
    }
}
