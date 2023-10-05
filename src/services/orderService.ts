import { Prisma, PrismaClient } from '@prisma/client';
import * as Order from '@DTO/order.dto';
import { NotFoundError, NotCorrectTypeError, NotEnoughError } from '@errors';
const prisma = new PrismaClient();

export default {
  async order(
    { storeid }: { storeid: number },
    { menus, totalPrice, preOrderId }: Order.newOrderInterface['Body']
  ): Promise<Order.newOrderInterface['Reply']['200']> {
    const order = await prisma.order.create({
      data: {
        storeId: storeid,
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
  async pay(
    { storeid }: { storeid: number },
    {
      orderId,
      paymentMethod,
      useMileage,
      saveMileage,
      mileageId,
    }: Order.payInterface['Body']
  ): Promise<Order.payInterface['Reply']['200']> {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
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

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentStatus: 'PAID',
        mileageId: mileageId,
        useMileage: useMileage,
        saveMileage: saveMileage,
      },
    });

    return null;
  },

  async getOrder(
    { storeid }: { storeid: number },
    { orderId }: Order.getOrderInterface['Params']
  ): Promise<Order.getOrderInterface['Reply']['200']> {
    const order = await prisma.order.findUnique({
      where: {
        id: Number(orderId),
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
    if (order.storeId !== storeid) {
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
    return { paymentStatus, totalPrice, createdAt, orderitems, pay, mileage, isPreOrdered };
  },
  async getOrderList(
    { storeid }: { storeid: number },
    { page, count, date }: Order.getOrderListInterface['Querystring']
  ): Promise<Order.getOrderListInterface['Reply']['200']> {
    const reservationDate = new Date(date);
    const krDate = new Date(reservationDate.getTime() + 9 * 60 * 60 * 1000);
    const krDateStr = new Date(krDate.toISOString().split('T')[0]);
    const krDateEnd = new Date(krDateStr.getTime() + 24 * 60 * 60 * 1000);
    const utcDateStr = new Date(krDateStr.getTime() - 9 * 60 * 60 * 1000);
    const utcDateEnd = new Date(krDateEnd.getTime() - 9 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        storeId: storeid,
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
        storeId: storeid,
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
