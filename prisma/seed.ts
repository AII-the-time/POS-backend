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
  }); //user id 1

  const store = await prisma.store.create({
    data: {
      id: 1,
      userId: 1,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }); //store id 1

  const store2 = await prisma.store.create({
    data: {
      id: 2,
      userId: 1,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }); //store id 2

  const category1 = await prisma.category.create({
    data: {
      id: 1,
      storeId: 1,
      name: '커피',
      sort: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const category2 = await prisma.category.create({
    data: {
      id: 2,
      storeId: 1,
      name: '티&에이드',
      sort: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const option = await Promise.all(
    [
      {
        optionName: 'ice',
        optionPrice: 0,
        optionCategory: '온도',
        storeId: 1,
      },
      {
        optionName: 'hot',
        optionPrice: 0,
        optionCategory: '온도',
        storeId: 1,
      },
      {
        optionName: '케냐',
        optionPrice: 0,
        optionCategory: '원두',
        storeId: 1,
      },
      {
        optionName: '콜롬비아',
        optionPrice: 300,
        optionCategory: '원두',
        storeId: 1,
      },
      {
        optionName: '1샷 추가',
        optionPrice: 500,
        optionCategory: '샷',
        storeId: 1,
      },
      {
        optionName: '연하게',
        optionPrice: 0,
        optionCategory: '샷',
        storeId: 1,
      },
    ].map(async (option, index) => {
      return await prisma.option.create({
        data: {
          id: index + 1,
          ...option,
        },
      });
    })
  );

  const menu = await Promise.all(
    [
      {
        name: '아메리카노',
        price: 2000,
        storeId: 1,
        categoryId: 1,
        sort: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: '카페라떼',
        price: 3000,
        storeId: 1,
        categoryId: 1,
        sort: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: '아이스티',
        price: 2500,
        storeId: 1,
        categoryId: 2,
        sort: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ].map(async (menu, index) => {
      return await prisma.menu.create({
        data: { id: index + 1, ...menu },
      });
    })
  );

  await Promise.all(
    menu.flatMap((menu) => {
      return option.map((option) => {
        if (menu.name === '아이스티' && option.optionName === 'hot') return;
        if (menu.name === '아이스티' && option.optionName === '연하게') return;
        return prisma.optionMenu.create({
          data: {
            menuId: menu.id,
            optionId: option.id,
          },
        });
      });
    })
  );

  const order = await prisma.order.create({
    data: {
      storeId: 1,
      paymentStatus: 'WAITING',
      totalPrice: 7500,
      orderitems: {
        create: menu.map((menu) => {
          return {
            count: 1,
            menuId: menu.id,
          };
        }),
      },
      createdAt: new Date(
        new Date('2022-01-01 00:00:00').getTime() + 9 * 60 * 60 * 1000
      ),
      updatedAt: new Date(
        new Date('2022-01-01 00:00:00').getTime() + 9 * 60 * 60 * 1000
      ),
    },
  });
  const mileage = await prisma.mileage.create({
    data: {
      phone: '01023456789',
      mileage: 0,
      storeId: store.id,
    },
  });
  await menuSeed(prisma, store.id);
}

main()
  .catch((e) => console.log(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
