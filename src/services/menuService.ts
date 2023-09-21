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
                    },
                    include: {
                        optionMenu: {
                            include: {
                                option: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                sort: 'asc'
            }
        });

        const result = categories.map((category) => {
            const menus = category.menu.map((menu) => {
                const options = menu.optionMenu.map((optionMenu) => {
                    return {
                        id: optionMenu.option.id,
                        name: optionMenu.option.optionName,
                        price: optionMenu.option.optionPrice.toString(),
                        optionType: optionMenu.option.optionCategory
                    }
                })

                const categorizedOptions = options.reduce((acc, cur) => {
                    if(acc[cur.optionType]===undefined) {
                        acc[cur.optionType] = [];
                    }
                    acc[cur.optionType].push({
                        id: cur.id,
                        name: cur.name,
                        price: cur.price
                    });
                    return acc;
                }, {} as {[key:string]:{id:number,name:string,price:string}[]});

                return {
                    id: menu.id,
                    name: menu.name,
                    price: menu.price.toString(),
                    option: Object.entries(categorizedOptions).map(([optionType, options]) => {
                        return {
                            optionType,
                            options
                        }
                    })
                }
            });

            return {
                category: category.name,
                categoryId: category.id,
                menus
            }
        })
        return {categories: result};
    }
}
