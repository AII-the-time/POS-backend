import { PrismaClient } from '@prisma/client';
import { NotFoundError, NotCorrectTypeError, ExistError } from '@errors';
import checkPhoneNumber from '@utils/checkPhoneNumber';
import * as Mileage from '@DTO/mileage.dto';
const prisma = new PrismaClient();

export default {
  async getMileage(
    { storeId }: Mileage.getMileageInterface['Body'],
    { phone }: Mileage.getMileageInterface['Querystring']
  ): Promise<Mileage.getMileageInterface['Reply']['200']> {
    const mileage = await prisma.mileage.findFirst({
      where: {
        phone: phone,
        storeId,
      },
    });

    if (!mileage) {
      throw new NotFoundError('해당하는 마일리지가 없습니다.', '마일리지');
    }
    return { mileageId: mileage.id, mileage: mileage.mileage.toString() };
  },

  async registerMileage(
    { storeId, phone }: Mileage.registerMileageInterface['Body']
  ): Promise<Mileage.registerMileageInterface['Reply']['200']> {
    if (!checkPhoneNumber(phone)) {
      throw new NotCorrectTypeError(
        '입력된 전화번호이(가) 양식과 맞지 않습니다.',
        '전화번호'
      );
    }
    const existMileage = await prisma.mileage.findFirst({
      where: {
        phone,
        storeId,
      },
    });
    if (existMileage) {
      throw new ExistError('입력된 전화번호가 이미 존재합니다.', '전화번호');
    }
    const mileage = await prisma.mileage.create({
      data: {
        phone,
        mileage: 0,
        storeId,
      },
    });

    return { mileageId: mileage.id };
  },

  async saveMileage({
    storeId,
    mileageId,
    mileage,
  }: Mileage.saveMileageInterface['Body']): Promise<
    Mileage.saveMileageInterface['Reply']['200']
  > {
    const savedMileage = await prisma.mileage.update({
      where: {
        id: mileageId,
        storeId,
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
