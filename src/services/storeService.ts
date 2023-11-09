import { PrismaClient } from '@prisma/client';
import * as Store from '@DTO/store.dto';
import menuSeed from '@seeding/menuSeed';
const prisma = new PrismaClient();

export default {
  async newStore({
    userId,
    name,
    address,
    openingHours,
  }: Store.newStoreInterface['Body']): Promise<
    Store.newStoreInterface['Reply']['200']
  > {
    const store = await prisma.store.create({
      data: {
        name: name,
        address: address,
        defaultOpeningHours: openingHours as any,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return { storeId: store.id };
  },

  async registDefaultOption({ storeId }: { storeId: number }): Promise<void> {
    await prisma.option.createMany({
      data: [
        {
          optionName: 'ice',
          optionPrice: 0,
          optionCategory: '온도',
        },
        {
          optionName: 'hot',
          optionPrice: 0,
          optionCategory: '온도',
        },
        {
          optionName: '원두1',
          optionPrice: 0,
          optionCategory: '원두',
        },
        {
          optionName: '원두2',
          optionPrice: 300,
          optionCategory: '원두',
        },
        {
          optionName: '1샷 추가',
          optionPrice: 500,
          optionCategory: '샷',
        },
        {
          optionName: '샷 빼기',
          optionPrice: 0,
          optionCategory: '샷',
        },
      ].map((option) => ({
        ...option,
        storeId,
      })),
    });
  },

  async exampleSeeding({ storeId }: { storeId: number }): Promise<void> {
    await prisma.category.create({
      data: {
        name: '커피',
        sort: 1,
        storeId,
      },
    });
    await prisma.stock.createMany({
      data: [
        {
          name: '물',
          unit: 'ml',
          noticeThreshold: -1,
          storeId,
        },
        {
          name: '원두(예시)',
          unit: 'g',
          noticeThreshold: 1000,
          currentAmount: 10000,
          storeId,
        },
        {
          name: '우유(예시)',
          unit: 'ml',
          noticeThreshold: 1000,
          currentAmount: 500,
          storeId,
        }
      ]
    });

    await prisma.menu.create({
      data:
      {
        name: '아메리카노(예시)',
        sort: 1,
        price: 2500,
        categoryId: 1,
        storeId,
        optionMenu: {
          create: [1,2,3,4,5,6].map((optionId) => ({optionId}))
        },
        recipes: {
          create: [
            {
              stockId: 1,
              coldRegularAmount: 150,
            },{
              stockId: 2,
              coldRegularAmount: 25,
            }
          ]
        }
      }
    });
    await prisma.menu.create({
        data: {
          name: '카페라떼(예시)',
          price: 3000,
          sort: 2,
          categoryId: 1,
          storeId,
          optionMenu: {
            create: [1,2,3,4,5,6].map((optionId) => ({optionId}))
          },
          recipes: {
            create: [
              {
                stockId: 2,
                coldRegularAmount: 25,
              },{
                stockId: 3,
                coldRegularAmount: 150,
              }
            ]
          }
        }
    });

  },

  async seeding({ storeId }: { storeId: number }): Promise<void> {
    await menuSeed(prisma, storeId);
  },

  async getStoreList({
    userId,
  }: Store.storeListInterface['Body']): Promise<
    Store.storeListInterface['Reply']['200']
  > {
    const stores = await prisma.store.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        address: true,
      },
    });

    return {
      stores: stores.map((store) => ({
        storeId: store.id,
        name: store.name,
        address: store.address,
      })),
    };
  },

  async updateStore({
    storeId,
    name,
    address,
    openingHours,
  }: Store.updateStoreInterface['Body']): Promise<
    Store.updateStoreInterface['Reply']['201']
  > {
    await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        name,
        address,
        defaultOpeningHours: openingHours as any,
      },
    });

    return { storeId };
  },
};
