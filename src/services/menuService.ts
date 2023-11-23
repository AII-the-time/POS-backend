import { Prisma,PrismaClient } from '@prisma/client';
import { NotFoundError } from '@errors';
import * as Menu from '@DTO/menu.dto';
import { STATUS, getStockStatus } from '@utils/stockStatus';
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
              where: {
                OR: [
                  { 
                    stock: {
                      deletedAt: null,
                    },
                  },
                  {
                    mixedStock: {
                      deletedAt: null,
                    },
                  },
                ],
              },
              include: {
                stock: true,
                mixedStock: {
                  select: {
                    mixings: {
                      select: {
                        stock: true,
                      },
                      where: {
                        stock: {
                          deletedAt: null,
                        },
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
        const stockStatuses = usingStocks
          .concat(usingStocksInMixedStocks)
          .filter(({noticeThreshold})=>noticeThreshold>=0)
          .map(({ currentAmount, noticeThreshold }) => getStockStatus(currentAmount, noticeThreshold));
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

  async getCostHistory(recipes: Prisma.RecipeGetPayload<{
    include: {
      stock: {
        include: {
          history: true,
        },
      },
      mixedStock: {
        include: {
          mixings: {
            include: {
              stock: {
                include: {
                  history: true,
                }
              }
            }
          }
        },
      }
    }
  }>[])
  :Promise<Menu.getMenuInterface['Reply']['200']['history']> {
    const usingStocks = recipes.filter(({ stock }) => stock!==null&&stock!.noticeThreshold>=0);
    if(usingStocks.some(({ stock }) => stock!.currentAmount===null || stock!.amount===null || stock!.price===null))
      return [];

    const usingMixedStocks = recipes.filter(({ mixedStock }) => mixedStock!==null);
    if(usingMixedStocks.some(({ mixedStock }) => mixedStock!.totalAmount===null))
      return [];

    if(usingMixedStocks.some(({ mixedStock }) => mixedStock!.mixings.some(({ stock }) => stock.currentAmount===null || stock.amount===null || stock.price===null)))
      return [];

    const stockHistory = usingStocks
      .map(({ stock,coldRegularAmount }) => ({
        id: stock!.id,
        history: stock!.history
          .map(({ createdAt,amount,price }) => ({
            date: createdAt.toISOString().split('T')[0],
            price: coldRegularAmount!*price.toNumber()/amount,
          })),
      }));
      
    const stockInMixedStocksHistory = usingMixedStocks
      .flatMap(({ mixedStock,coldRegularAmount }) =>{
        const totalAmount = mixedStock!.totalAmount!;
        return mixedStock!.mixings.map(({ stock,amount }) => (
          {
            id: stock.id,
            history: stock.history.map(({ createdAt,amount: historyAmount,price }) => ({
              date: createdAt.toISOString().split('T')[0],
              price: coldRegularAmount!*amount*price.toNumber()/historyAmount/totalAmount,
            })),
          }
        ));
      });

    const allHistory = stockHistory.concat(stockInMixedStocksHistory).map(({history})=>history)
      .map((history) => history.reduce((acc, {date,price})=>{
          const sameDateIndex = acc.findIndex((history)=>history.date===date);
          if(sameDateIndex!==-1){
            acc[sameDateIndex].price=price;
            return acc;
          }
          acc.push({date,price});
          return acc;
        },[] as {date:string,price:number}[])
      );

    const [initPrice,initDate] = allHistory.reduce((acc, history) => {
      const initPrice = history[0].price;
      const initDate = history[0].date;
      return [acc[0]+initPrice,acc[1].localeCompare(initDate)<0?initDate:acc[1]];
    }, [0,'1900-01-01'] as [number,string]);

    const updateHistory = allHistory.reduce((acc, history) => {
      for (let i = 1; i < history.length; i++) {
        const currentDate = history[i].date;
        const currentPrice = history[i].price;
        const previousPrice = history[i-1].price;
        const priceDifference = currentPrice - previousPrice;
        if (acc[currentDate] !== undefined) {
          acc[currentDate] += priceDifference;
        } else {
          acc[currentDate] = priceDifference;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    const sortedHistory = Object.entries(updateHistory).sort(([date1], [date2]) => {
      return date1.localeCompare(date2);
    })

    const accumulatedHistory = sortedHistory.reduce((acc, [date, price]) => {
      const curPrice = acc[acc.length - 1].price;
      acc.push({
        date,
        price: curPrice + price,
      });
      return acc;
    }, [{ date: initDate, price: initPrice }]);
    
    return accumulatedHistory.filter(({date}) => date.localeCompare(initDate)>=0).map(({date,price})=>({
      date:`${date}T00:00:00.000Z`,
      price:price.toFixed(2)
    }));
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
        optionMenu: {
          where: {
            option:{
              deletedAt: null,
            }
          }
        },
        category: true,
        recipes: {
          include: {
            stock: {
              include: {
                history: true,
              },
            },
            mixedStock: {
              include: {
                mixings: {
                  include: {
                    stock: {
                      include: {
                        history: true,
                      }
                    }
                  },
                  where: {
                    stock: {
                      deletedAt: null,
                    },
                  },
                }
              },
            }
          },
          where: {
            OR: [
              { 
                stock: {
                  deletedAt: null,
                },
              },
              {
                mixedStock: {
                  deletedAt: null,
                },
              },
            ],
          },
        },
      },
    });
    if (!menu) {
      throw new NotFoundError('메뉴가 존재하지 않습니다.', '메뉴');
    }

    const allOption = await prisma.option.findMany({
      where: {
        storeId,
        deletedAt: null,
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
      history: await this.getCostHistory(menu.recipes),
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
    const { optionMenu: preOptionMenu } = await prisma.option.update({
      where: {
        id: optionId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
      include: {
        optionMenu: true,
      },
    });
    const result = await prisma.option.create({
      data: {
        storeId,
        optionName,
        optionPrice,
        optionCategory,
        optionMenu: {
          createMany: {
            data: preOptionMenu.map(({ menuId }) => ({
              menuId,
            })),
          }
        }
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
  ): Promise<void> {
    await prisma.category.update({
      where: {
        id: categoryId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    await prisma.menu.updateMany({
      where: {
        categoryId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
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
  ): Promise<void> {
    await prisma.menu.update({
      where: {
        id: menuId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  },

  async softDeleteOption(
    { storeId }: Menu.softDeleteOptionInterface['Body'],
    { optionId }: Menu.softDeleteOptionInterface['Params']
  ): Promise<void> {
    await prisma.option.update({
      where: {
        id: optionId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  },
};
