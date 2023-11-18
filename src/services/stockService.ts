import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '@errors';
import * as Stock from '@DTO/stock.dto';
import { STATUS, getStockStatus } from '@utils/stockStatus';

const prisma = new PrismaClient();

export default {
  async createStock({
    storeId,
    name,
    price,
    amount,
    currentAmount,
    noticeThreshold,
    unit,
  }: Stock.createStockInterface['Body']): Promise<
    Stock.createStockInterface['Reply']['201']
  > {
    const result = await prisma.stock.create({
      data: {
        name,
        price,
        amount,
        currentAmount,
        noticeThreshold,
        unit,
        storeId,
      },
    });

    return {
      stockId: result.id,
    };
  },

  async updateStock({
    storeId,
    name,
    price,
    amount,
    currentAmount,
    noticeThreshold,
    unit,
    id,
  }: Stock.updateStockInterface['Body']): Promise<
    Stock.updateStockInterface['Reply']['201']
  > {
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
        currentAmount,
        noticeThreshold,
      },
    });

    return {
      stockId: result.id,
    };
  },

  async getStockList({
    storeId,
  }: Stock.getStockListInterface['Body']): Promise<
    Stock.getStockListInterface['Reply']['200']
  > {
    const result = await prisma.stock.findMany({
      where: {
        storeId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            recipes: {
              where: {
                menu: {
                  deletedAt: null,
                },
              },
            },
          },
        },
        mixings: {
          where:{
            mixedStock: {
              deletedAt: null,
            }
          },
          select: {
            mixedStock: {
              select: {
                _count: {
                  select: {
                    recipes: {
                      where: {
                        menu: {
                          deletedAt: null,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      stocks: result.map(
        ({ id, name, currentAmount, noticeThreshold, _count, mixings }) => {
          const status = STATUS[getStockStatus(currentAmount, noticeThreshold)];

          return {
            id,
            name,
            status,
            usingMenuCount:
              _count.recipes +
              mixings.reduce(
                (
                  acc,
                  {
                    mixedStock: {
                      _count: { recipes },
                    },
                  }
                ) => acc + recipes,
                0
              ),
          };
        }
      ),
    };
  },

  async softDeleteStock(
    { storeId }: Stock.softDeleteStockInterface['Body'],
    { stockId }: Stock.softDeleteStockInterface['Params']
  ): Promise<void> {
    await prisma.stock.update({
      where: {
        id: stockId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  },

  async getStock(
    { storeId }: Stock.getStockInterface['Body'],
    { stockId }: Stock.getStockInterface['Params']
  ): Promise<Stock.getStockInterface['Reply']['200']> {
    const result = await prisma.stock.findUnique({
      where: {
        id: stockId,
        storeId,
        deletedAt: null,
      },
    });
    if (!result) {
      throw new NotFoundError('재고가 존재하지 않습니다.', '재고');
    }

    return {
      name: result.name,
      price: result.price === null ? null : result.price.toString(),
      amount: result.amount,
      currentAmount: result.currentAmount,
      noticeThreshold: result.noticeThreshold,
      unit: result.unit,
      updatedAt: result.updatedAt.toISOString(),
    };
  },

  async createMixedStock({
    storeId,
    name,
    totalAmount,
    unit,
    mixing,
  }: Stock.createMixedStockInterface['Body']): Promise<
    Stock.createMixedStockInterface['Reply']['201']
  > {
    const result = await prisma.mixedStock.create({
      data: {
        name,
        storeId,
        unit,
        totalAmount,
        mixings: {
          create: mixing.map(({ id, amount }) => ({
            stockId: id,
            amount,
          })),
        },
      },
      include: {
        mixings: {
          include: {
            stock: true,
          },
        },
      },
    });

    //레시피에 대한 재고에 unit 정보가 없는 경우, 재고에 unit 정보를 추가해준다.
    await Promise.all(
      result.mixings.map(async ({ stock }) => {
        if (stock.unit !== null) return;
        const unit = mixing!.find(({ id }) => id === stock.id)?.unit;
        await prisma.stock.update({
          where: {
            id: stock.id,
          },
          data: {
            unit,
          },
        });
      })
    );

    return {
      mixedStockId: result.id,
    };
  },

  async updateMixedStock({
    storeId,
    id,
    name,
    totalAmount,
    unit,
    mixing,
  }: Stock.updateMixedStockInterface['Body']): Promise<
    Stock.updateMixedStockInterface['Reply']['201']
  > {
    //delete all mixings
    await prisma.mixing.deleteMany({
      where: {
        mixedStockId: id,
      },
    });

    const result = await prisma.mixedStock.update({
      where: {
        id,
        storeId,
      },
      data: {
        name,
        storeId,
        unit,
        totalAmount,
        mixings: {
          create: mixing.map(({ id, amount }) => ({
            stockId: id,
            amount,
          })),
        },
      },
      include: {
        mixings: {
          include: {
            stock: true,
          },
        },
      },
    });

    //레시피에 대한 재고에 unit 정보가 없는 경우, 재고에 unit 정보를 추가해준다.
    await Promise.all(
      result.mixings.map(async ({ stock }) => {
        if (stock.unit !== null) return;
        const unit = mixing!.find(({ id }) => id === stock.id)?.unit;
        await prisma.stock.update({
          where: {
            id: stock.id,
          },
          data: {
            unit,
          },
        });
      })
    );

    return {
      mixedStockId: result.id,
    };
  },

  async softDeleteMixedStock(
    { storeId }: Stock.softDeleteMixedStockInterface['Body'],
    { mixedStockId }: Stock.softDeleteMixedStockInterface['Params']
  ): Promise<void> {
    await prisma.mixedStock.update({
      where: {
        id: mixedStockId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  },

  async getMixedStockList({
    storeId,
  }: Stock.getMixedStockListInterface['Body']): Promise<
    Stock.getMixedStockListInterface['Reply']['200']
  > {
    const result = await prisma.mixedStock.findMany({
      where: {
        storeId,
        deletedAt: null,
      },
    });

    return {
      mixedStocks: result.map(({ id, name }) => ({
        id,
        name,
      })),
    };
  },

  async getMixedStock(
    { storeId }: Stock.getMixedStockInterface['Body'],
    { mixedStockId }: Stock.getMixedStockInterface['Params']
  ): Promise<Stock.getMixedStockInterface['Reply']['200']> {
    const result = await prisma.mixedStock.findUnique({
      where: {
        id: mixedStockId,
        storeId,
        deletedAt: null,
      },
      include: {
        mixings: {
          include: {
            stock: true,
          },
          where: {
            stock: {
              deletedAt: null,
            },
          }
        },
      },
    });
    if (!result) {
      throw new NotFoundError('재고가 존재하지 않습니다.', '재고');
    }

    return {
      name: result.name,
      totalAmount: result.totalAmount,
      unit: result.unit,
      mixing: result.mixings.map(({ stock, amount }) => ({
        id: stock.id,
        name: stock.name,
        amount,
        unit: stock.unit,
      })),
    };
  },

  async searchStock(
    { storeId }: Stock.searchStockInterface['Body'],
    { name }: Stock.searchStockInterface['Querystring']
  ): Promise<Stock.searchStockInterface['Reply']['200']> {
    const result = await prisma.stock.findMany({
      where: {
        storeId,
        deletedAt: null,
        name: {
          contains: name,
        },
      },
    });

    return {
      stocks: result.map((stock) => ({
        id: stock.id,
        name: stock.name,
      })),
    };
  },

  async searchStockAndMixedStock(
    { storeId }: Stock.searchStockAndMixedStockInterface['Body'],
    { name }: Stock.searchStockAndMixedStockInterface['Querystring']
  ): Promise<Stock.searchStockAndMixedStockInterface['Reply']['200']> {
    const [result, mixedResult] = await Promise.all([
      prisma.stock.findMany({
        where: {
          storeId,
          deletedAt: null,
          name: {
            contains: name,
          },
        },
      }),
      prisma.mixedStock.findMany({
        where: {
          storeId,
          deletedAt: null,
          name: {
            contains: name,
          },
        },
      }),
    ]);

    return {
      stocks: result
        .map((stock) => ({
          id: stock.id,
          name: stock.name,
          isMixed: false,
        }))
        .concat(
          mixedResult.map((stock) => ({
            id: stock.id,
            name: stock.name,
            isMixed: true,
          }))
        ),
    };
  },
};
