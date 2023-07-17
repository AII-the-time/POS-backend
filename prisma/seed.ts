import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const store = await prisma.store.create({
        data: {
            name: 'test',
            address: 'test',
            phone: 'test',
            businessRegistrationNumber: 'test',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    const menu = await prisma.menu.create({
        data: {
            name: '아메리카노',
            price: 1000,
            storeId: store.id,
            category: '커피',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
}

main()
    .catch((e) => console.log(e))
    .finally(async () => {
        await prisma.$disconnect()
    });