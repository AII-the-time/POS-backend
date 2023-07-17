import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const store = await prisma.store.create({
        data: {
            name: '소예다방',
            address: '고려대 근처',
            phone: '010-1234-5678',
            businessRegistrationNumber: '0123456789',
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
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: '카페라떼',
                price: 3000,
                storeId: store.id,
                category: '커피',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: '아이스티',
                price: 2500,
                storeId: store.id,
                category: '티&에이드',
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
