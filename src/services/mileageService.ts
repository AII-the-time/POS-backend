import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundError } from '@errors';
import { LoginToken } from '@utils/jwt';
import * as Mileage from '@DTO/mileage.dto';
const prisma = new PrismaClient();

export default {
  async getMileage(
    { storeid }: { storeid: number },
    { phone }: Mileage.getMileageInterface['Querystring']
  ): Promise<Mileage.getMileageInterface['Reply']['200']> {
    const mileage = await prisma.mileage.findFirst({
      where: {
        phone: phone,
        storeId: storeid,
      },
    });

    if (!mileage) {
      throw new NotFoundError('해당하는 마일리지가 없습니다.', '마일리지');
    }
    return { mileageId: mileage.id, mileage: mileage.mileage.toString() };
  },

  async registerMileage(
    { storeid }: { storeid: number },
    { phone }: Mileage.registerMileageInterface['Body']
  ): Promise<Mileage.registerMileageInterface['Reply']['200']> {
    const mileage = await prisma.mileage.create({
      data: {
        phone: phone,
        mileage: 0,
        storeId: storeid,
      },
    });

    return { mileageId: mileage.id };
  },

  async saveMileage({
    mileageId,
    mileage,
  }: Mileage.saveMileageInterface['Body']): Promise<
    Mileage.saveMileageInterface['Reply']['200']
  > {
    const savedMileage = await prisma.mileage.update({
      where: {
        id: mileageId,
      },
      data: {
        mileage: {
          increment: mileage,
        },
      },
    });

    return { mileage: savedMileage.mileage.toString() };
  },
};
