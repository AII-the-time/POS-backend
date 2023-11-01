import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '@errors';
import * as Menu from '@DTO/menu.dto';

const prisma = new PrismaClient();

export default {
  async getMenuList({
    storeId,
  }: Menu.getMenuListInterface['Body']): Promise<
    Menu.getMenuListInterface['Reply']['200']
  > {
    const categories = await prisma.category.findMany({
      where: {
        storeId,
        deletedAt: null,
      },
      include: {
        menu: {
          where: {
            deletedAt: null,
          },

          orderBy: {
            sort: 'asc',
          },
          include: {
            optionMenu: true,
            recipes: {
              include: {
                stock: true,
                mixedStock: {
                  select: {
                    mixings: {
                      select: {
                        stock: true,
                      },
                    }
                  },
                }
              },
            },
          },
        },
      },
      orderBy: {
        sort: 'asc',
      },
    });
    const result = categories.map((category) => {
      const menus = category.menu.map((menu) => {
        const usingStocks = menu.recipes.filter(({ stock }) => stock!==null).map(({ stock }) => stock!);
        const usingStocksInMixedStocks = menu.recipes.filter(({ mixedStock }) => mixedStock!==null).flatMap(({ mixedStock }) => mixedStock!.mixings.map(({ stock }) => stock));
        const STATUS = ['UNKNOWN', 'EMPTY', 'OUT_OF_STOCK', 'CAUTION', 'ENOUGH'] as const;
        const STATUS_ENUM = STATUS.reduce((acc, cur, idx) => ({ ...acc, [cur]: idx }), {} as Record<typeof STATUS[number], number>);
        const stockStatuses = usingStocks
          .concat(usingStocksInMixedStocks)
          .filter(({noticeThreshold})=>noticeThreshold>=0)
          .map(({ currentAmount, noticeThreshold }) => {
            if (currentAmount === null) return STATUS_ENUM['UNKNOWN'];
            if (currentAmount < noticeThreshold * 0.1) return STATUS_ENUM['EMPTY'];
            if (currentAmount < noticeThreshold * 0.3) return STATUS_ENUM['OUT_OF_STOCK'];
            if (currentAmount < noticeThreshold) return STATUS_ENUM['CAUTION'];
            return STATUS_ENUM['ENOUGH'];
          });
        return ({
        id: menu.id,
        name: menu.name,
        price: menu.price.toString(),
        stockStatus: STATUS[Math.min(...stockStatuses)]
      })});

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
        deletedAt: null,
      },
      include: {
        optionMenu: true,
        category: true,
        recipes: {
          include: {
            stock: true,
            mixedStock: true,
          },
        },
      },
    });
    if (!menu) {
      // 해당 에러는 test 중 menuService.test.ts 에서 테스트 함.
      // test 이름은 get not exist menu detail
      throw new NotFoundError('메뉴가 존재하지 않습니다.', '메뉴');
    }

    const allOption = await prisma.option.findMany({
      where: {
        storeId,
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

    const recipe = menu.recipes.map(
      ({
        stock,
        mixedStock,
        coldRegularAmount,
        coldSizeUpAmount,
        hotRegularAmount,
        hotSizeUpAmount,
      }) => {
        const recipeStock = stock ?? mixedStock;
        const { id, name, unit } = recipeStock!;
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
      }
    );
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
  async getOptionList({
    storeId,
  }: Menu.getOptionListInterface['Body']): Promise<
    Menu.getOptionListInterface['Reply']['200']
  > {
    const options = await prisma.option.findMany({
      where: {
        storeId,
        deletedAt: null,
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

  async updateOption({
    storeId,
    optionName,
    optionPrice,
    optionCategory,
    optionId,
  }: Menu.updateOptionInterface['Body']): Promise<
    Menu.updateOptionInterface['Reply']['201']
  > {
    const result = await prisma.option.update({
      where: {
        id: optionId,
        storeId,
      },
      data: {
        optionName,
        optionPrice,
        optionCategory,
        id: optionId,
      },
    });
    return {
      optionId: result.id,
    };
  },

  async createCategory({
    name,
    storeId,
  }: Menu.createCategoryInterface['Body']): Promise<
    Menu.createCategoryInterface['Reply']['201']
  > {
    const categoryCount = await prisma.category.count({
      where: {
        storeId,
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

  async updateCategory({
    name,
    storeId,
    id,
  }: Menu.updateCategoryInterface['Body']): Promise<
    Menu.updateCategoryInterface['Reply']['201']
  > {
    await prisma.category.update({
      where: {
        id,
        storeId,
      },
      data: {
        name: name,
      },
    });
    return {
      categoryId: id,
    };
  },

  async softDeleteCategory(
    { storeId }: Menu.softDeleteCategoryInterface['Body'],
    { categoryId }: Menu.softDeleteCategoryInterface['Params']
  ): Promise<Menu.softDeleteCategoryInterface['Reply']['200']> {
    await prisma.category.update({
      where: {
        id: categoryId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return { categoryId };
  },

  async createMenu({
    storeId,
    name,
    price,
    categoryId,
    option,
    recipe,
  }: Menu.createMenuInterface['Body']): Promise<
    Menu.createMenuInterface['Reply']['201']
  > {
    const menuCount = await prisma.menu.count({
      where: {
        storeId,
        categoryId: categoryId,
      },
    });
    if (!option) option = [];
    if (!recipe) recipe = [];
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
          create: recipe.map(
            ({
              id,
              isMixed,
              coldRegularAmount,
              coldSizeUpAmount,
              hotRegularAmount,
              hotSizeUpAmount,
            }) => ({
              stockId: isMixed ? undefined : id,
              mixedStockId: isMixed ? id : undefined,
              coldRegularAmount,
              coldSizeUpAmount,
              hotRegularAmount,
              hotSizeUpAmount,
            })
          ),
        },
      },
      include: {
        recipes: {
          include: {
            stock: true,
            mixedStock: true,
          },
        },
      },
    });

    //레시피에 대한 재고에 unit 정보가 없는 경우, 재고에 unit 정보를 추가해준다.
    await Promise.all(
      result.recipes.map(async ({ stock, mixedStock }) => {
        if (stock) {
          if (stock.unit !== null) return;
          const unit = recipe!.find(
            ({ id, isMixed }) => id === stock.id && isMixed === false
          )?.unit;
          await prisma.stock.update({
            where: {
              id: stock.id,
            },
            data: {
              unit,
            },
          });
        }
        if (mixedStock) {
          if (mixedStock.unit !== null) return;
          const unit = recipe!.find(
            ({ id, isMixed }) => id === mixedStock.id && isMixed === true
          )?.unit;
          await prisma.mixedStock.update({
            where: {
              id: mixedStock.id,
            },
            data: {
              unit,
            },
          });
        }
      })
    );

    return {
      menuId: result.id,
    };
  },

  async updateMenu({
    storeId,
    name,
    price,
    categoryId,
    option,
    recipe,
    id,
  }: Menu.updateMenuInterface['Body']): Promise<
    Menu.updateMenuInterface['Reply']['201']
  > {
    if (!option) option = [];
    if (!recipe) recipe = [];
    const createMenu = await prisma.menu.create({
      data: {
        name,
        price,
        storeId,
        categoryId,
        sort: 1,
        optionMenu: {
          create: option.map((id) => ({
            optionId: id,
          })),
        },
        recipes: {
          create: recipe.map(
            ({
              id,
              isMixed,
              coldRegularAmount,
              coldSizeUpAmount,
              hotRegularAmount,
              hotSizeUpAmount,
            }) => ({
              stockId: isMixed ? undefined : id,
              mixedStockId: isMixed ? id : undefined,
              coldRegularAmount,
              coldSizeUpAmount,
              hotRegularAmount,
              hotSizeUpAmount,
            })
          ),
        },
      },
      include: {
        recipes: {
          include: {
            stock: true,
            mixedStock: true,
          },
        },
      },
    });
    const softDeleteMenu = await prisma.menu.update({
      where: {
        id,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
      include: {
        optionMenu: true,
        recipes: {
          include: {
            stock: true,
            mixedStock: true,
          },
        },
      },
    });

    if (!option) option = [];

    const optionMenuIds = softDeleteMenu.optionMenu
      .map(({ optionId }) => optionId)
      .sort();
    const optionIds = option.sort();
    if (optionMenuIds.toString() !== optionIds.toString()) {
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

    await Promise.all(
      createMenu.recipes.map(async ({ stock, mixedStock }) => {
        if (stock) {
          if (stock.unit !== null) return;
          const unit = recipe!.find(
            ({ id, isMixed }) => id === stock.id && isMixed === false
          )?.unit;
          await prisma.stock.update({
            where: {
              id: stock.id,
            },
            data: {
              unit,
            },
          });
        }
        if (mixedStock) {
          if (mixedStock.unit !== null) return;
          const unit = recipe!.find(
            ({ id, isMixed }) => id === mixedStock.id && isMixed === true
          )?.unit;
          await prisma.mixedStock.update({
            where: {
              id: mixedStock.id,
            },
            data: {
              unit,
            },
          });
        }
      })
    );

    return {
      menuId: createMenu.id,
    };
  },

  async softDeleteMenu(
    { storeId }: Menu.softDeleteMenuInterface['Body'],
    { menuId }: Menu.softDeleteMenuInterface['Params']
  ): Promise<Menu.softDeleteMenuInterface['Reply']['200']> {
    await prisma.menu.update({
      where: {
        id: menuId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return { menuId };
  },

  async softDeleteOption(
    { storeId }: Menu.softDeleteOptionInterface['Body'],
    { optionId }: Menu.softDeleteOptionInterface['Params']
  ): Promise<Menu.softDeleteOptionInterface['Reply']['200']> {
    await prisma.option.update({
      where: {
        id: optionId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return { optionId };
  },
};
