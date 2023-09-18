import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.create({
    data: {
      businessRegistrationNumber: '0123456789',
      phoneNumber: '010-1234-5678',
    },
  });

  const store = await prisma.store.create({
    data: {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const category1 = await prisma.category.create({
    data: {
      name: '커피',
      sort: 1,
      storeId: store.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const category2 = await prisma.category.create({
    data: {
      name: '티&에이드',
      sort: 2,
      storeId: store.id,
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
        storeId: store.id,
      },
      {
        optionName: 'hot',
        optionPrice: 0,
        optionCategory: '온도',
        storeId: store.id,
      },
      {
        optionName: '케냐',
        optionPrice: 0,
        optionCategory: '원두',
        storeId: store.id,
      },
      {
        optionName: '콜롬비아',
        optionPrice: 300,
        optionCategory: '원두',
        storeId: store.id,
      },
      {
        optionName: '1샷 추가',
        optionPrice: 500,
        optionCategory: '샷',
        storeId: store.id,
      },
      {
        optionName: '연하게',
        optionPrice: 0,
        optionCategory: '샷',
        storeId: store.id,
      },
    ].map(async (option) => {
      return await prisma.option.create({
        data: option,
      });
    })
  );

  const menu = await Promise.all(
    [
      {
        name: '아메리카노',
        price: 2000,
        storeId: store.id,
        categoryId: category1.id,
        sort: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: '카페라떼',
        price: 3000,
        storeId: store.id,
        categoryId: category1.id,
        sort: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: '아이스티',
        price: 2500,
        storeId: store.id,
        categoryId: category2.id,
        sort: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ].map(async (menu) => {
      return await prisma.menu.create({
        data: menu,
      });
    })
  );

  await Promise.all(
    menu.flatMap((menu) => {
      return option.map((option) =>
        prisma.optionMenu.create({
          data: {
            menuId: menu.id,
            optionId: option.id,
          },
        })
      );
    })
  );

  const dumpOrder = await prisma.order.create({
    data: {
      storeId: store.id,
      paymentStatus: 'WAITING',
      totalPrice: 10000,
      orderitems: {
        create: menu.map((menu) => {
          return {
            count: 1,
            menuId: menu.id,
          };
        }),
      },
      createdAt: new Date('2022-01-01 00:00:00'),
      updatedAt: new Date('2022-01-01 00:00:00'),
    },
  });
}

main()
  .catch((e) => console.log(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
