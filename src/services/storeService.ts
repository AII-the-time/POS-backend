import { PrismaClient } from '@prisma/client';
import * as Store from '@DTO/store.dto';
import { LoginToken } from '@utils/jwt';
const prisma = new PrismaClient();

export default {
  async newStore(
    { userid }: { userid: number },
    { name, address, openingHours }: Store.newStoreInterface['Body']
  ): Promise<Store.newStoreInterface['Reply']['200']> {
    const store = await prisma.store.create({
      data: {
        name: name,
        address: address,
        defaultOpeningHours: openingHours as any,
        user: {
          connect: {
            id: userid,
          },
        },
      },
    });

    return { storeId: store.id };
  },

  async getStoreList({
    userid,
  }: {
    userid: number;
  }): Promise<Store.storeListInterface['Reply']['200']> {
    const stores = await prisma.store.findMany({
      where: {
        userId: userid,
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
