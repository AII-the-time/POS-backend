import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const user = await prisma.user.create({
        data: {
            businessRegistrationNumber: '0123456789',
            phoneNumber: '010-1234-5678',
        }
    });

    const store = await prisma.store.create({
        data: {
            userId: user.id,
            name: '소예다방',
            address: '고려대 근처',
            defaultOpeningHours: [
                {
                    "yoil": "일",
                    "start": null,
                    "end" : null //휴무일은 시작시간과 종료시간 모두 null 이어야함
                },
                {
                    "yoil": "월",
                    "start": "09:00",
                    "end" : "18:00"
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    await Promise.all(
        [
            {
                name: '아메리카노',
                price: 2000,
                storeId: store.id,
                category: '커피',
                sort: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: '카페라떼',
                price: 3000,
                storeId: store.id,
                category: '커피',
                sort: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: '아이스티',
                price: 2500,
                storeId: store.id,
                category: '티&에이드',
                sort: 3,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ].map(async (menu) => {
            await prisma.menu.create({
                data: menu
            });
        })
    );
}

main()
    .catch((e) => console.log(e))
    .finally(async () => {
        await prisma.$disconnect()
    });
