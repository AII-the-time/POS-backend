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
        recipes: {
          include: {
            stock: true,
            mixedStock: true,
          },
        }
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

    const recipe = menu.recipes.map(({ stock, mixedStock, coldRegularAmount, coldSizeUpAmount, hotRegularAmount, hotSizeUpAmount }) => {
      const recipeStock = stock ?? mixedStock;
      if(!recipeStock)
        throw new NotFoundError('재고가 존재하지 않습니다.', '재고');
      const { id, name, unit } = recipeStock;
      return {
        id,
        isMixed: stock === null,
        name,
        unit,
        coldRegularAmount,
        coldSizeUpAmount,
        hotRegularAmount,
        hotSizeUpAmount,
      };
    });
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
      recipe,
    };
  },
  async getOptionList(
    { storeId }: Menu.getOptionListInterface['Body']
  ): Promise<Menu.getOptionListInterface['Reply']['200']> {
    const options = await prisma.option.findMany({
      where: {
        storeId
      },
    });
    const categorizedOption = options.reduce((acc, option) => {
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
      };
      if (acc[type]) {
        acc[type].push(curOption);
      } else {
        acc[type] = [curOption];
      }
      return acc;
    }, {} as Record<string, Menu.getOptionListInterface['Reply']['200']['option'][0]['options']>);
    return {
      option: Object.entries(categorizedOption).map(
        ([optionType, options]) => ({
          optionType,
          options,
        })
      ),
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
    if(!recipe)
      recipe = [];
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
        recipes: {
          create: recipe.map(({ id, isMixed, coldRegularAmount, coldSizeUpAmount, hotRegularAmount, hotSizeUpAmount}) => ({
            storeId,
            stockId: isMixed ? undefined : id,
            mixedStockId: isMixed ? id : undefined,
            coldRegularAmount,
            coldSizeUpAmount,
            hotRegularAmount,
            hotSizeUpAmount,
          })),
        },
      },
      include: {
        recipes: {
          include: {
            stock: true,
            mixedStock: true,
          },
        }
      },
    });
    
    //레시피에 대한 재고에 unit 정보가 없는 경우, 재고에 unit 정보를 추가해준다.
    await Promise.all(result.recipes.map(async ({ stockId, mixedStockId }) => {
      if(stockId) {
        const unit = recipe!.find(({ id, isMixed }) => id === stockId&&isMixed===false)?.unit;
        await prisma.stock.update({
          where: {
            id: stockId,
          },
          data: {
            unit,
          },
        });
      }
      if(mixedStockId) {
        const unit = recipe!.find(({ id, isMixed }) => id === mixedStockId&&isMixed===true)?.unit;
        await prisma.mixedStock.update({
          where: {
            id: mixedStockId,
          },
          data: {
            unit,
          },
        });
      }
    }));

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
        recipes: {
          include: {
            stock: true,
            mixedStock: true,
          },
        }
      },
    });

    if(!option)
      option = [];
    if(!recipe)
      recipe = [];

    const optionMenuIds = result.optionMenu.map(({ optionId }) => optionId).sort();
    const optionIds = option.sort();
    if(optionMenuIds.toString() !== optionIds.toString()) {
      await prisma.optionMenu.deleteMany({
        where: {
          menuId: id,
        },
      });
      await prisma.optionMenu.createMany({
        data: option.map((optionId) => ({
          menuId: id,
          optionId,
        })),
      });
    }
    
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
