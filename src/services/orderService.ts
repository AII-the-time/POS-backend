import { Prisma, PrismaClient } from '@prisma/client';
import * as Order from '@DTO/order.dto';
import { NotFoundError, NotCorrectTypeError, NotEnoughError } from '@errors';
const prisma = new PrismaClient();

export default {
  async order({
    storeId,
    menus,
    totalPrice,
    preOrderId,
  }: Order.newOrderInterface['Body']): Promise<
    Order.newOrderInterface['Reply']['200']
  > {
    const order = await prisma.order.create({
      data: {
        storeId,
        paymentStatus: 'WAITING',
        totalPrice: totalPrice,
        preOrderId: preOrderId ?? undefined,
        orderitems: {
          create: menus.map((menu) => {
            return {
              count: menu.count,
              menuId: menu.id,
              detail: menu.detail,
              optionOrderItems: {
                create: menu.options.map((option) => {
                  return {
                    optionId: option,
                  };
                }),
              },
            };
          }),
        },
      },
    });
    return { orderId: order.id };
  },
  async pay({
    storeId,
    orderId,
    paymentMethod,
    useMileage,
    saveMileage,
    mileageId,
  }: Order.payInterface['Body']): Promise<Order.payInterface['Reply']['200']> {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        storeId,
      },
      include: {
        payment: true,
      },
    });
    if (order === null) {
      // orderService.test 에서 test
      // test 이름은 pay not exist order
      throw new NotFoundError('해당하는 주문이 없습니다.', '주문');
    }
    if (order.paymentStatus !== 'WAITING') {
      // orderService.test 에서 test
      // test 이름은 pay again
      throw new NotFoundError('이미 결제된 주문입니다.', '결제 예정 주문');
    }

    if (mileageId !== undefined && mileageId !== null) {
      const mileage = await prisma.mileage.findUnique({
        where: {
          id: mileageId,
        },
      });
      if (mileage === null) {
        // orderService.test 에서 test
        // test 이름은 pay with not exist mileage
        throw new NotFoundError('해당하는 마일리지가 없습니다.', '마일리지');
      }
      if (
        useMileage === undefined ||
        saveMileage === undefined ||
        useMileage === null ||
        saveMileage === null
      ) {
        // orderService.test 에서 test
        // test 이름은 pay without useMileage and saveMileage
        throw new NotCorrectTypeError(
          '사용할 마일리지와 적립할 마일리지를 입력해주세요.',
          '사용할 마일리지와 적립할 마일리지'
        );
      }
      if (mileage.mileage.comparedTo(useMileage) < 0) {
        throw new NotEnoughError('마일리지가 부족합니다.');
      }
      await prisma.mileage.update({
        where: {
          id: mileage.id,
        },
        data: {
          mileage: Prisma.Decimal.sum(
            Prisma.Decimal.sub(mileage.mileage, useMileage),
            saveMileage
          ),
        },
      });
    }

    await prisma.payment.create({
      data: {
        orderId: orderId,
        paymentMethod: paymentMethod,
        price: Prisma.Decimal.sub(order.totalPrice, useMileage ?? 0),
      },
    });

    const orders = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentStatus: 'PAID',
        mileageId: mileageId,
        useMileage: useMileage,
        saveMileage: saveMileage,
      },
      include: {
        orderitems: {
          include: {
            menu: {
              include: {
                recipes: {
                  include: {
                    stock: true,
                    mixedStock: {
                      include: {
                        mixings: {
                          include: {
                            stock: true,
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
      },
    });

    const materials = orders.orderitems.flatMap((orderitem) =>
      orderitem.menu.recipes.map((recipe) => ({
        ...recipe,
        count: orderitem.count,
      }))
    );
    const stocks = materials
      .filter(
        ({ stock, coldRegularAmount }) =>
          stock !== null &&
          coldRegularAmount !== null &&
          stock.currentAmount !== null
      )
      .map(({ stock, count, coldRegularAmount }) => {
        return {
          id: stock!.id,
          amount: coldRegularAmount! * count,
          currentAmount: stock!.currentAmount!,
        };
      });
    const mixedStocks = materials
      .filter(
        ({ mixedStock, coldRegularAmount }) =>
          mixedStock !== null &&
          coldRegularAmount !== null &&
          mixedStock.totalAmount !== null &&
          mixedStock.totalAmount !== 0
      )
      .flatMap(({ mixedStock, count, coldRegularAmount }) => {
        const totalAmount = mixedStock!.totalAmount!;
        const useRate = coldRegularAmount! / totalAmount;
        return mixedStock!.mixings
          .filter(({ stock: { currentAmount } }) => currentAmount !== null)
          .map(({ amount, stock: { id, currentAmount } }) => {
            return {
              id: id,
              amount: amount * useRate * count,
              currentAmount: currentAmount!,
            };
          });
      });
    await Promise.all(
      stocks.concat(mixedStocks).map(({ id, amount, currentAmount }) => {
        return prisma.stock.update({
          where: {
            id,
          },
          data: {
            currentAmount:
              currentAmount - amount < 0 ? 0 : currentAmount - amount,
          },
        });
      })
    );
    return null;
  },

  async getOrder(
    { storeId }: Order.getOrderInterface['Body'],
    { orderId }: Order.getOrderInterface['Params']
  ): Promise<Order.getOrderInterface['Reply']['200']> {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        storeId: storeId,
      },
      include: {
        orderitems: {
          include: {
            menu: true,
            optionOrderItems: {
              include: {
                option: true,
              },
            },
          },
        },
        payment: true,
      },
    });
    if (order === null) {
      // orderService.test 에서 test
      // test 이름은 get not exist order
      throw new NotFoundError('해당하는 주문이 없습니다.', '주문');
    }

    const paymentStatus = order.paymentStatus as
      | 'WAITING'
      | 'PAID'
      | 'CANCELED';
    const totalPrice = order.totalPrice.toString();
    const createdAt = order.createdAt;
    const orderitems = order.orderitems.map((orderitem) => {
      return {
        count: orderitem.count,
        price: orderitem.menu.price.toString(),
        menuName: orderitem.menu.name,
        detail: orderitem.detail ?? '',
        options: orderitem.optionOrderItems.map((optionOrderItem) => ({
          name: optionOrderItem.option.optionName,
          price: optionOrderItem.option.optionPrice.toString(),
        })),
      };
    });
    const pay = {
      paymentMethod: order.payment[0].paymentMethod as 'CARD' | 'CASH' | 'BANK',
      price: order.payment[0].price.toString(),
    };
    const mileage =
      order.mileageId === null
        ? undefined
        : {
            mileageId: order.mileageId,
            use: order.useMileage!.toString(),
            save: order.saveMileage!.toString(),
          };
    const isPreOrdered = order.preOrderId !== null;
    return {
      paymentStatus,
      totalPrice,
      createdAt,
      orderitems,
      pay,
      mileage,
      isPreOrdered,
    };
  },

  async softDeletePay(
    { storeId }: Order.softDeletePayInterface['Body'],
    { orderId }: Order.softDeletePayInterface['Params']
  ): Promise<Order.softDeletePayInterface['Reply']['200']> {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        storeId,
      },
      include: {
        payment: true,
      },
    });
    if (order === null) {
      throw new NotFoundError('해당하는 주문이 없습니다.', '주문');
    }
    if (order.paymentStatus !== 'PAID') {
      throw new NotFoundError('결제되지 않은 주문입니다.', '결제된 주문');
    }
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentStatus: 'CANCELED',
        deletedAt: new Date(),
      },
    });
    return { orderId };
  },

  async getOrderList(
    { storeId }: Order.getOrderListInterface['Body'],
    { page, count, date }: Order.getOrderListInterface['Querystring']
  ): Promise<Order.getOrderListInterface['Reply']['200']> {
    date = date ?? new Date().toISOString().split('T')[0];
    const reservationDate = new Date(date);
    const krDate = new Date(reservationDate.getTime() + 9 * 60 * 60 * 1000);
    const krDateStr = new Date(krDate.toISOString().split('T')[0]);
    const krDateEnd = new Date(krDateStr.getTime() + 24 * 60 * 60 * 1000);
    const utcDateStr = new Date(krDateStr.getTime() - 9 * 60 * 60 * 1000);
    const utcDateEnd = new Date(krDateEnd.getTime() - 9 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        storeId: storeId,
        createdAt: {
          gte: utcDateStr,
          lt: utcDateEnd,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * count,
      take: count,
      include: {
        payment: true,
        orderitems: true,
      },
    });

    const list = orders.map((order) => ({
      paymentStatus: order.paymentStatus as
        | 'WAITING'
        | 'PAID'
        | 'CANCELED'
        | 'FAILED',
      paymentMethod:
        order.paymentStatus === 'WAITING'
          ? undefined
          : (order.payment[0].paymentMethod as 'CARD' | 'CASH' | 'BANK'),
      totalCount: order.orderitems.reduce((acc, cur) => acc + cur.count, 0),
      totalPrice: order.totalPrice.toString(),
      createdAt: order.createdAt,
      orderId: order.id,
      isPreOrdered: order.preOrderId !== null,
    }));

    const totalOrderCount = await prisma.order.count({
      where: {
        storeId,
        createdAt: {
          gte: krDateStr,
          lt: krDateEnd,
        },
      },
    });

    const lastPage = Math.ceil(totalOrderCount / count);
    return { orders: list, lastPage, totalOrderCount };
  },
};
