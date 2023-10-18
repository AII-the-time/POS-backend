import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '@errors';
import * as Stock from '@DTO/stock.dto';

const prisma = new PrismaClient();

export default {
  async createStock(
    { storeId, name, price, amount,currentAmount, unit }: Stock.createStockInterface['Body']
  ): Promise<Stock.createStockInterface['Reply']['201']> {
    const result = await prisma.stock.create({
      data: {
        name,
        price,
        amount,
        currentAmount,
        unit,
        storeId,
      },
    });

    return {
      stockId: result.id,
    };
  },

  async updateStock(
    { storeId, name, price, amount, currentAmount, unit, id }: Stock.updateStockInterface['Body']
  ): Promise<Stock.updateStockInterface['Reply']['201']> {
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
      },
    });

    return {
      stockId: result.id,
    };
  },

  async getStockList(
    { storeId }: Stock.getStockListInterface['Body']
  ): Promise<Stock.getStockListInterface['Reply']['200']> {
    const result = await prisma.stock.findMany({
      where: {
        storeId,
      }
    });

    return {
      stocks: result.map(({ id, name, currentAmount, unit }) => ({
        id,
        name,
        status: currentAmount === 0 ? '없음' : currentAmount < 10 ? '부족' : '여유', // TODO: 재고 상태를 구하는 로직 필요
        usingMenuCount: 0, // TODO: 재고를 사용하는 메뉴 개수를 구하는 로직 필요
      })),
    };
  },

  async getStock(
    { storeId }: Stock.getStockInterface['Body'],
    { stockId }: Stock.getStockInterface['Params']
  ): Promise<Stock.getStockInterface['Reply']['200']> {
    const result = await prisma.stock.findUnique({
      where: {
        id: stockId,
        storeId,
      },
    });
    if (!result) {
      throw new NotFoundError('재고가 존재하지 않습니다.', '재고');
    }

    return {
      name: result.name,
      price: result.price===null?"0":result.price.toString(),
      amount: result.amount,
      currentAmount: result.currentAmount,
      unit: result.unit,
    };
  },

  async createMixedStock(
    { storeId, name, totalAmount, unit, mixing }: Stock.createMixedStockInterface['Body']
  ): Promise<Stock.createMixedStockInterface['Reply']['201']> {
    const result = await prisma.mixedStock.create({
      data: {
        name,
        storeId,
        unit,
        totalAmount,
        mixings: {
          create: mixing.map(({ id, amount}) => ({
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
    await Promise.all(result.mixings.map(async ({ stock }) => {
      if(stock.unit !== null)
        return;
      const unit = mixing!.find(({ id }) => id === stock.id)?.unit;
      await prisma.stock.update({
        where: {
          id: stock.id,
        },
        data: {
          unit,
        },
      });
    }));

    return {
      mixedStockId: result.id,
    };
  },
  
  async updateMixedStock(
    { storeId, id, name, totalAmount, unit, mixing }: Stock.updateMixedStockInterface['Body']
  ): Promise<Stock.updateMixedStockInterface['Reply']['201']> {
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
          create: mixing.map(({ id, amount}) => ({
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
    await Promise.all(result.mixings.map(async ({ stock }) => {
      if(stock.unit !== null)
        return;
      const unit = mixing!.find(({ id }) => id === stock.id)?.unit;
      await prisma.stock.update({
        where: {
          id: stock.id,
        },
        data: {
          unit,
        },
      });
    }));

    return {
      mixedStockId: result.id,
    };
  },

  async getMixedStockList(
    { storeId }: Stock.getMixedStockListInterface['Body']
  ): Promise<Stock.getMixedStockListInterface['Reply']['200']> {
    const result = await prisma.mixedStock.findMany({
      where: {
        storeId,
      }
    });

    return {
      mixedStocks: result.map(({ id, name }) => ({
        id,
        name
      }))
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
      },
      include: {
        mixings: {
          include: {
            stock: true,
          },
        },
      },
    });
    if (!result) {
      // 해당 에러는 test 중 menuService.test.ts 에서 테스트 함.
      // test 이름은 get not exist menu detail
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
    { name }: Stock.searchStockInterface['Querystring'],
  ): Promise<Stock.searchStockInterface['Reply']['200']> {
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
        name: stock.name,
      }))
    };
  },

  async searchStockAndMixedStock(
    { storeId }: Stock.searchStockAndMixedStockInterface['Body'],
    { name }: Stock.searchStockAndMixedStockInterface['Querystring'],
  ): Promise<Stock.searchStockAndMixedStockInterface['Reply']['200']> {
    const [result, mixedResult] = await Promise.all([
      prisma.stock.findMany({
        where: {
          storeId,
          name: {
            contains: name,
          },
        },
      }),
      prisma.mixedStock.findMany({
        where: {
          storeId,
          name: {
            contains: name,
          },
        },
      })
    ]);

    return {
      stocks: result.map((stock) => ({
        id: stock.id,
        name: stock.name,
        isMixed: false,
      })).concat(mixedResult.map((stock) => ({
        id: stock.id,
        name: stock.name,
        isMixed: true,
      }))),
    };
  }
};
