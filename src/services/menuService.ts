import { PrismaClient } from "@prisma/client";
import { NotFoundError } from '@errors';
import * as Menu from "@DTO/menu.dto";

const prisma = new PrismaClient();

export default {
    async getMenuList({storeid}: {storeid:number}): Promise<Menu.getMenuListInterface['Reply']['200']> {
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
    },

    async getMenu({storeid}: {storeid:number},{menuId}:{menuId:number}): Promise<Menu.getMenuInterface['Reply']['200']> {
        const menu = await prisma.menu.findUnique({
            where: {
                id: menuId
            },
            include: {
                optionMenu: true,
                category: true
            }
        });
        if (!menu) {
            throw new NotFoundError('메뉴가 존재하지 않습니다.');
        }

        const allOption = await prisma.option.findMany({
            where: {
                storeId: Number(storeid)
            }
        });

        const categorizedOption = allOption.reduce(
            (acc, option) => {
                const { id, optionCategory: type, optionName: name, optionPrice: price } = option;
                const curOption = {
                    id,
                    name,
                    price: price.toString(),
                    isSelectable: menu.optionMenu.some(({optionId}) => optionId === id)
                };
                if (acc[type]) {
                    acc[type].push(curOption);
                } else {
                    acc[type] = [curOption];
                }
                return acc;
            },
            {} as  Record<string, Menu.getMenuInterface['Reply']['200']['option'][0]['options']>
        );

        return {
            name: menu.name,
            price: menu.price.toString(),
            categoryId: menu.categoryId,
            category: menu.category.name,
            option: Object.entries(categorizedOption).map(
                ([optionType, options]) => ({
                    optionType,
                    options
                })
            ),
            recipe: []
        }
    }
}
