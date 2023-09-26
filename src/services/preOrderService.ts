import { Prisma, PrismaClient } from '@prisma/client';
import * as PreOrder from '@DTO/preOrder.dto';
const prisma = new PrismaClient();

export default {
  async preOrder(
    { storeid }: { storeid: number },
    {
      menus,
      totalPrice,
      reservationDateTime,
    }: PreOrder.newPreOrderInterface['Body']
  ): Promise<PreOrder.newPreOrderInterface['Reply']['200']> {
    const preOrder = await prisma.preOrder.create({
      data: {
        storeId: storeid,
        totalPrice: totalPrice,
        reservationDateTime: reservationDateTime,
        preOrderitems: {
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
    return { preOrderId: preOrder.id };
  },

  async getPreOrder(
    { storeid }: { storeid: number },
    { preOrderId }: PreOrder.getPreOrderInterface['Params']
  ): Promise<PreOrder.getPreOrderInterface['Reply']['200']> {
    const preOrder = await prisma.preOrder.findUnique({
      where: {
        id: Number(preOrderId),
      },
      include: {
        preOrderitems: {
          include: {
            menu: true,
            optionOrderItems: {
              include: {
                option: true,
              },
            },
          },
        },
      },
    });
    if (preOrder === null) {
      throw new Error('주문이 존재하지 않습니다.');
    }
    if (preOrder.storeId !== storeid) {
      throw new Error('주문이 존재하지 않습니다.');
    }
    if (preOrder.reservationDateTime === null) {
      throw new Error('예약 주문이 아닙니다.');
    }
    const totalPrice = preOrder.totalPrice.toString();
    const createdAt = preOrder.createdAt;
    const preOrderitems = preOrder.preOrderitems.map((orderitem) => {
      return {
        id: orderitem.id,
        count: orderitem.count,
        price: orderitem.menu.price.toString(),
        menuName: orderitem.menu.name,
        detail: orderitem.detail ?? '',
        options: orderitem.optionOrderItems.map((optionOrderItem) => ({
          id: optionOrderItem.option.id,
          name: optionOrderItem.option.optionName,
          price: optionOrderItem.option.optionPrice.toString(),
        })),
      };
    });
    const reservationDateTime = preOrder.reservationDateTime;
    return {
      totalPrice,
      createdAt,
      preOrderitems,
      reservationDateTime,
      preOrderId: preOrder.id,
    };
  },
  async getPreOrderList(
    { storeid }: { storeid: number },
    {
      page,
      endPage,
      count,
      date,
    }: PreOrder.getPreOrderListInterface['Querystring']
  ): Promise<PreOrder.getPreOrderListInterface['Reply']['200']> {
    const splitDate = date
      ? date.split('T')
      : new Date().toLocaleString().split('T');
    const reservationDate = splitDate[0] + 'T00:00:00.000Z';
    const preOrders = await prisma.preOrder.findMany({
      where: {
        storeId: storeid,
        createdAt: { gte: reservationDate },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page! - 1) * count!,
      take: count,
      include: {
        preOrderitems: true,
      },
    });

    const list = preOrders.map((preOrder) => ({
      totalPrice: preOrder.totalPrice.toString(),
      createdAt: preOrder.createdAt,
      reservationDateTime:
        preOrder.reservationDateTime ?? new Date(reservationDate),
      // reservationDateTime이 null일 경우에 현재 에러가 발생하는데 이를 어떻게 처리하는 것이 좋은지 잘 모르겠음...
      preOrderId: preOrder.id,
      totalCount: preOrder.preOrderitems.reduce(
        (acc, cur) => acc + cur.count,
        0
      ),
    }));
    return { preOrders: list };
  },
};
