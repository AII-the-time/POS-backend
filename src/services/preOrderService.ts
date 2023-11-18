import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError, NotCorrectTypeError, ExistError } from '@errors';
import * as PreOrder from '@DTO/preOrder.dto';
const prisma = new PrismaClient();

export default {
  async preOrder({
    storeId,
    menus,
    totalPrice,
    phone,
    memo,
    orderedFor,
  }: PreOrder.newPreOrderInterface['Body']): Promise<
    PreOrder.newPreOrderInterface['Reply']['200']
  > {
    const preOrder = await prisma.preOrder.create({
      data: {
        storeId,
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

  async updatePreOrder({
    storeId,
    totalPrice,
    phone,
    memo,
    orderedFor,
    menus,
    id,
  }: PreOrder.updatePreOrderInterface['Body']): Promise<
    PreOrder.updatePreOrderInterface['Reply']['201']
  > {
    await prisma.preOrder.update({
      where: {
        id,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      }
    });

    const result = await prisma.preOrder.create({
      data: {
        totalPrice,
        phone,
        memo,
        orderedFor,
        storeId,
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
    return { preOrderId: result.id };
  },

  async softDeletePreOrder(
    { storeId }: PreOrder.softDeletePreOrderInterface['Body'],
    { preOrderId }: PreOrder.softDeletePreOrderInterface['Params']
  ): Promise<void> {
    await prisma.preOrder.update({
      where: {
        id: preOrderId,
        storeId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  },

  async getPreOrder(
    { storeId }: PreOrder.getPreOrderInterface['Body'],
    { preOrderId }: PreOrder.getPreOrderInterface['Params']
  ): Promise<PreOrder.getPreOrderInterface['Reply']['200']> {
    const preOrder = await prisma.preOrder.findUnique({
      where: {
        id: preOrderId,
        storeId,
        deletedAt: null,
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
    { storeId }: PreOrder.getPreOrderListInterface['Body'],
    { page, count, date }: PreOrder.getPreOrderListInterface['Querystring']
  ): Promise<PreOrder.getPreOrderListInterface['Reply']['200']> {
    date = date ?? new Date().toISOString();
    const reservationDate = new Date(date);
    const krDate = new Date(reservationDate.getTime() + 9 * 60 * 60 * 1000);
    const krDateStr = new Date(krDate.toISOString().split('T')[0]);
    const krDateEnd = new Date(krDateStr.getTime() + 24 * 60 * 60 * 1000);
    const utcDateStr = new Date(krDateStr.getTime() - 9 * 60 * 60 * 1000);
    const utcDateEnd = new Date(krDateEnd.getTime() - 9 * 60 * 60 * 1000);
    const [preOrders, totalPreOrderCount] = await Promise.all([
      prisma.preOrder.findMany({
        where: {
          storeId,
          deletedAt: null,
          orderedFor: {
            gte: utcDateStr,
            lt: utcDateEnd,
          },
          order: {
            is: null,
          },
        },
        orderBy: {
          orderedFor: 'desc',
        },
        skip: (page - 1) * count,
        take: count,
        include: {
          preOrderitems: true,
        },
      }),
      prisma.preOrder.count({
        where: {
          storeId,
          orderedFor: {
            gte: utcDateStr,
            lt: utcDateEnd,
          },
        },
      }),
    ]);

    const lastPage = Math.ceil(totalPreOrderCount / count);

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
      lastPage,
      totalPreOrderCount,
    };
  },
};
