import { PrismaClient } from '@prisma/client';
import menuSeed from './menuSeed';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.create({
    data: {
      id: 1,
      businessRegistrationNumber: '0123456789',
      phoneNumber: '01012345678',
    },
  });

  const store = await prisma.store.create({
    data: {
      id: 1,
      userId: user.id,
      name: '소예다방',
      address: '고려대 근처',
      defaultOpeningHours: [
        {
          yoil: '일',
          start: null,
          end: null, //휴무일은 시작시간과 종료시간 모두 null 이어야함
        },
        {
          yoil: '월',
          start: '09:00',
          end: '18:00',
        },
      ],
    },
  }); //store id 1

  await menuSeed(prisma, store.id);
}

main()
  .catch((e) => console.log(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
