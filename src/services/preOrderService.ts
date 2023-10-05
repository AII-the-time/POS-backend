import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError, NotCorrectTypeError, ExistError } from '@errors';
import * as PreOrder from '@DTO/preOrder.dto';
const prisma = new PrismaClient();

export default {
  async preOrder(
    { storeid }: { storeid: number },
    {
      menus,
      totalPrice,
      phone,
      memo,
      orderedFor,
    }: PreOrder.newPreOrderInterface['Body']
  ): Promise<PreOrder.newPreOrderInterface['Reply']['200']> {
    const preOrder = await prisma.preOrder.create({
      data: {
        storeId: storeid,
        totalPrice,
        phone,
        memo,
        orderedFor,
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
        id: preOrderId,
        storeId: storeid,
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
      throw new NotFoundError('해당하는 예약 주문이 없습니다.', '예약 주문');
    }
    const totalPrice = preOrder.totalPrice.toString();
    const totalCount = preOrder.preOrderitems.reduce(
      (acc, cur) => acc + cur.count,
      0
    );
    const createdAt = preOrder.createdAt;
    const orderedFor = preOrder.orderedFor;
    const phone = preOrder.phone;
    const memo = preOrder.memo ?? '';
    const orderitems = preOrder.preOrderitems.map((orderitem) => {
      return {
        id: orderitem.menu.id,
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
    return {
      totalPrice,
      totalCount,
      createdAt,
      orderedFor,
      phone,
      memo,
      orderitems,
    };
  },

  async getPreOrderList(
    { storeid }: { storeid: number },
    { page, count, date }: PreOrder.getPreOrderListInterface['Querystring']
  ): Promise<PreOrder.getPreOrderListInterface['Reply']['200']> {
    const reservationDate = new Date(date);
    const krDate = new Date(reservationDate.getTime() - 9 * 60 * 60 * 1000);
    const krDateStr = new Date(krDate.toISOString().split('T')[0]);
    const krDateEnd = new Date(krDateStr.getTime() + 24 * 60 * 60 * 1000);

    const preOrders = await prisma.preOrder.findMany({
      where: {
        storeId: storeid,
        createdAt: {
          gte: krDateStr,
          lt: krDateEnd,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * count,
      take: count,
      include: {
        preOrderitems: true,
      },
    });

    const endPage = Math.ceil(
      (await prisma.preOrder.count({
        where: {
          storeId: storeid,
          createdAt: {
            gte: krDateStr,
            lt: krDateEnd,
          },
        },
      })) / count
    );

    const list = preOrders.map((preOrder) => ({
      preOrderId: preOrder.id,
      totalCount: preOrder.preOrderitems.reduce(
        (acc, cur) => acc + cur.count,
        0
      ),
      totalPrice: preOrder.totalPrice.toString(),
      phone: preOrder.phone,
      memo: preOrder.memo ?? '',
      createdAt: preOrder.createdAt,
      orderedFor: preOrder.orderedFor,
    }));
    return {
      preOrders: list,
      endPage,
    };
  },
};
