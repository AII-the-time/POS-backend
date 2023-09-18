import { PrismaClient } from '@prisma/client';
import { StoreAuthorizationHeader } from '@DTO/index.dto';
import { LoginToken } from '@utils/jwt';
import * as Order from '@DTO/order.dto';
const prisma = new PrismaClient();

export default {
  async order(
    { storeid }: { storeid: number },
    { menus, totalPrice }: Order.newOrderInterface['Body']
  ): Promise<Order.newOrderInterface['Reply']['200']> {
    const order = await prisma.order.create({
      data: {
        storeId: storeid,
        paymentStatus: 'WAITING',
        totalPrice: totalPrice,
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
      throw new Error('주문이 존재하지 않습니다.');
    }
    if (order.paymentStatus !== 'WAITING') {
      throw new Error('이미 결제된 주문입니다.');
    }

    if (mileageId !== undefined && mileageId !== null) {
      const mileage = await prisma.mileage.findUnique({
        where: {
          id: mileageId,
        },
      });
      if (mileage === null) {
        throw new Error('마일리지가 존재하지 않습니다.');
      }
      if (mileage.storeId !== storeid) {
        throw new Error('마일리지가 존재하지 않습니다.');
      }
      if (
        useMileage === undefined ||
        saveMileage === undefined ||
        useMileage === null ||
        saveMileage === null
      ) {
        throw new Error('사용할 마일리지와 적립할 마일리지를 입력해주세요.');
      }
      if (mileage.mileage < useMileage) {
        throw new Error('마일리지가 부족합니다.');
      }
      await prisma.mileage.update({
        where: {
          id: mileage.id,
        },
        data: {
          mileage: mileage.mileage - useMileage + saveMileage,
        },
      });
    }

    await prisma.payment.create({
      data: {
        orderId: orderId,
        paymentMethod: paymentMethod,
        price: order.totalPrice - (useMileage ?? 0),
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
      throw new Error('주문이 존재하지 않습니다.');
    }
    if (order.storeId !== storeid) {
      throw new Error('주문이 존재하지 않습니다.');
    }

    const paymentStatus = order.paymentStatus as
      | 'WAITING'
      | 'PAID'
      | 'CANCELED';
    const totalPrice = order.totalPrice;
    const createdAt = order.createdAt;
    const orderitems = order.orderitems.map((orderitem) => {
      return {
        count: orderitem.count,
        price: orderitem.menu.price,
        menuName: orderitem.menu.name,
        detail: orderitem.detail ?? '',
        options: orderitem.optionOrderItems.map((optionOrderItem) => ({
          name: optionOrderItem.option.optionName,
          price: optionOrderItem.option.optionPrice,
        })),
      };
    });
    const pay = {
      paymentMethod: order.payment[0].paymentMethod as 'CARD' | 'CASH' | 'BANK',
      price: order.payment[0].price,
    };
    const mileage =
      order.mileageId === null
        ? undefined
        : {
            mileageId: order.mileageId,
            use: order.useMileage ?? 0,
            save: order.saveMileage ?? 0,
          };

    return { paymentStatus, totalPrice, createdAt, orderitems, pay, mileage };
  },
  async getOrderList(
    { storeid }: { storeid: number },
    { page, endPage, count, date }: Order.getOrderListInterface['Querystring']
  ): Promise<Order.getOrderListInterface['Reply']['200']> {
    const splitDate = date
      ? date.split('T')
      : new Date().toISOString().split('T');
    const orderDate = splitDate[0] + 'T00:00:00.000Z';
    const orders = await prisma.order.findMany({
      where: {
        storeId: storeid,
        createdAt: { gte: orderDate },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page! - 1) * count!,
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
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      orderId: order.id,
    }));
    return { orders: list };
  },
};
