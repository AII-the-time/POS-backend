import { PrismaClient } from '@prisma/client';
import * as Store from '@DTO/store.dto';
import menuSeed from '../../prisma/menuSeed';
const prisma = new PrismaClient();

export default {
  async newStore(
    { userId, name, address, openingHours }: Store.newStoreInterface['Body']
  ): Promise<Store.newStoreInterface['Reply']['200']> {
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
  
  async registDefaultOption(
    { storeId }: { storeId: number }
  ): Promise<void> {
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
          optionName: '케냐',
          optionPrice: 0,
          optionCategory: '원두',
        },
        {
          optionName: '콜롬비아',
          optionPrice: 300,
          optionCategory: '원두',
        },
        {
          optionName: '1샷 추가',
          optionPrice: 500,
          optionCategory: '샷',
        },
        {
          optionName: '연하게',
          optionPrice: 0,
          optionCategory: '샷',
        },
      ].map((option) => ({
        ...option,
        storeId,
      })),
    });
  },

  async seeding({ storeId }: { storeId: number }): Promise<void> {
    await menuSeed(prisma, storeId);
  },

  async getStoreList({
    userId,
  }: Store.storeListInterface['Body']
  ): Promise<Store.storeListInterface['Reply']['200']> {
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
};
