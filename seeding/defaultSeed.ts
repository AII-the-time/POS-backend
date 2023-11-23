import { PrismaClient } from '@prisma/client';

export default async (prisma: PrismaClient, storeId: number) => {
    const category = await prisma.category.create({
        data: {
            name: '커피',
            sort: 1,
            storeId,
        },
    });
    await prisma.stock.createMany({
        data: [
            {
                name: '물',
                unit: 'ml',
                noticeThreshold: -1,
                storeId,
            },
            {
                name: '원두(예시)',
                unit: 'g',
                noticeThreshold: 1000,
                currentAmount: 2000,
                storeId,
            },
            {
                name: '우유(예시)',
                unit: 'ml',
                noticeThreshold: 1000,
                currentAmount: 500,
                storeId,
            }
        ]
    });

    await prisma.menu.create({
        data:
        {
            name: '아메리카노(예시)',
            sort: 1,
            price: 2500,
            categoryId: category.id,
            storeId,
            optionMenu: {
                create: [1, 2, 3, 4, 5, 6].map((optionId) => ({ optionId }))
            },
            recipes: {
                create: [
                    {
                        stockId: 1,
                        coldRegularAmount: 150,
                    }, {
                        stockId: 2,
                        coldRegularAmount: 25,
                    }
                ]
            }
        }
    });
    await prisma.menu.create({
        data: {
            name: '카페라떼(예시)',
            price: 3000,
            sort: 2,
            categoryId: category.id,
            storeId,
            optionMenu: {
                create: [1, 2, 3, 4, 5, 6].map((optionId) => ({ optionId }))
            },
            recipes: {
                create: [
                    {
                        stockId: 2,
                        coldRegularAmount: 25,
                    }, {
                        stockId: 3,
                        coldRegularAmount: 150,
                    }
                ]
            }
        }
    });
}
