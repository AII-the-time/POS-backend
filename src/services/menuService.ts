import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '@errors';
import * as Menu from '@DTO/menu.dto';

const prisma = new PrismaClient();

export default {
  async getMenuList(
    { storeId }: Menu.getMenuListInterface['Body']
  ): Promise<Menu.getMenuListInterface['Reply']['200']> {
    const categories = await prisma.category.findMany({
      where: {
        storeId
      },
      include: {
        menu: {
          orderBy: {
            sort: 'asc',
          },
        },
      },
      orderBy: {
        sort: 'asc',
      },
    });

    const result = categories.map((category) => {
      const menus = category.menu.map((menu) => ({
        ...menu,
        price: menu.price.toString(),
      }));

      return {
        category: category.name,
        categoryId: category.id,
        menus,
      };
    });
    return { categories: result };
  },

  async getMenu(
    { storeId }: Menu.getMenuInterface['Body'],
    { menuId }: Menu.getMenuInterface['Params']
  ): Promise<Menu.getMenuInterface['Reply']['200']> {
    const menu = await prisma.menu.findUnique({
      where: {
        id: menuId,
      },
      include: {
        optionMenu: true,
        category: true,
      },
    });
    if (!menu) {
      // 해당 에러는 test 중 menuService.test.ts 에서 테스트 함.
      // test 이름은 get not exist menu detail
      throw new NotFoundError('메뉴가 존재하지 않습니다.', '메뉴');
    }

    const allOption = await prisma.option.findMany({
      where: {
        storeId
      },
    });

    const categorizedOption = allOption.reduce((acc, option) => {
      const {
        id,
        optionCategory: type,
        optionName: name,
        optionPrice: price,
      } = option;
      const curOption = {
        id,
        name,
        price: price.toString(),
        isSelectable: menu.optionMenu.some(({ optionId }) => optionId === id),
      };
      if (acc[type]) {
        acc[type].push(curOption);
      } else {
        acc[type] = [curOption];
      }
      return acc;
    }, {} as Record<string, Menu.getMenuInterface['Reply']['200']['option'][0]['options']>);

    return {
      name: menu.name,
      price: menu.price.toString(),
      categoryId: menu.categoryId,
      category: menu.category.name,
      option: Object.entries(categorizedOption).map(
        ([optionType, options]) => ({
          optionType,
          options,
        })
      ),
      recipe: [],
    };
  },

  async createCategory(
    { name, storeId }: Menu.createCategoryInterface['Body']
  ): Promise<Menu.createCategoryInterface['Reply']['201']> {
    const categoryCount = await prisma.category.count({
      where: {
        storeId
      },
    });
    const result = await prisma.category.create({
      data: {
        name: name,
        storeId,
        sort: categoryCount + 1,
      },
    });

    return {
      categoryId: result.id,
    };
  },

  async createMenu(
    { 
      storeId,
      name,
      price,
      categoryId,
      option,
      recipe,
    }: Menu.createMenuInterface['Body']
  ): Promise<Menu.createMenuInterface['Reply']['201']> {
    const menuCount = await prisma.menu.count({
      where: {
        storeId,
        categoryId: categoryId,
      },
    });
    if(!option)
      option = [];
    const result = await prisma.menu.create({
      data: {
        name,
        price,
        storeId,
        categoryId,
        sort: menuCount + 1,
        optionMenu: {
          create: option.map((id) => ({
            optionId: id,
          })),
        },
      },
    });

    return {
      menuId: result.id,
    };
  },

  async updateMenu(
    {
      storeId,
      name,
      price,
      categoryId,
      option,
      recipe,
      id,
    }: Menu.updateMenuInterface['Body']
  ): Promise<Menu.updateMenuInterface['Reply']['201']> {
    const result = await prisma.menu.update({
      where: {
        id,
        storeId,
      },
      data: {
        name,
        price,
        categoryId
      },
      include: {
        optionMenu: true,
      },
    });

    if(!option)
      option = [];
    const optionIds = option.map((id) => ({ optionId: id }));
    const optionMenuIds = result.optionMenu.map(({ optionId }) => ({ optionId }));

    const deleteOptionMenu = optionMenuIds.filter(({ optionId }) => !optionIds.some((id) => id.optionId === optionId));
    const createOptionMenu = optionIds.filter(({ optionId }) => !optionMenuIds.some((id) => id.optionId === optionId));

    await Promise.all([
      prisma.optionMenu.deleteMany({
        where: {
          menuId: id,
          optionId: {
            in: deleteOptionMenu.map(({ optionId }) => optionId),
          },
        },
      }),
      prisma.optionMenu.createMany({
        data: createOptionMenu.map(({ optionId }) => ({
          menuId: id,
          optionId,
        })),
      }),
    ]);

    return {
      menuId: result.id,
    };
  },
  async createStock(
    { storeId, name, price, amount, unit }: Menu.createStockInterface['Body']
  ): Promise<Menu.createStockInterface['Reply']['201']> {
    const result = await prisma.stock.create({
      data: {
        name,
        price,
        amount,
        unit,
        storeId,
      },
    });

    return {
      stockId: result.id,
    };
  },
  async updateStockInfo(
    { storeId, name, price, amount, unit, id }: Menu.updateStockInterface['Body']
  ): Promise<Menu.updateStockInterface['Reply']['201']> {
    const result = await prisma.stock.update({
      where: {
        id,
        storeId,
      },
      data: {
        name,
        price,
        amount,
        unit,
      },
    });

    return {
      stockId: result.id,
    };
  },

  async searchStock(
    { storeId }: Menu.searchStockInterface['Body'],
    { name }: Menu.searchStockInterface['Querystring'],
  ): Promise<Menu.searchStockInterface['Reply']['200']> {
    const result = await prisma.stock.findMany({
      where: {
        storeId,
        name: {
          contains: name,
        },
      },
    });

    return {
      stocks: result.map((stock) => ({
        id: stock.id,
        name: stock.name
      })),
    };
  }
};
