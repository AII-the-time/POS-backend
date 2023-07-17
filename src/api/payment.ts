import { FastifyInstance,FastifyPluginAsync, FastifyRequest,FastifyReply } from "fastify";
import { Menu } from '@prisma/client';

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.post<{
        Body: {
            storeId: number;
            menus: Array<{id:number,count:number}>;
        },
        Reply: {
            menus: Array<Object>;
        }
    }>('/', async (request, reply) => {
        const storeId = request.body.storeId;
        const menus: {id:number,count:number}[] = request.body.menus;
        const menusFromDatabase: Menu[] = await server.prisma.menu.findMany({
            where: {
                id: {
                    in: menus.map((menu) => menu.id)
                }
            }
        });
        if(menus.filter((menu) => menusFromDatabase.find((menuFromDatabase) => menuFromDatabase.id === menu.id) === undefined).length > 0) {
            return reply
                .code(404)
                .send();
        }

        const realMenus: {menuId:number, count:number, price:number}[] = menus.map((menu) => {
            return {
                menuId: menu.id,
                count: menu.count,
                price: Number(menusFromDatabase.find((menuFromDatabase) => menuFromDatabase.id === menu.id)?.price)
            }
        });
        const totalPrice = realMenus.reduce((acc, cur) => acc + cur.price * cur.count, 0);

        const payment = await server.prisma.payment.create({
            data: {
                storeId: storeId,
                paymentMethod: "credit",
                paymentStatus: "paid",
                totalPrice: totalPrice,
                createdAt: new Date(),
                updatedAt: new Date(),
                orderitems: {
                    create: realMenus
                }
            },
            include: {
                orderitems: true
            }
        });
        reply.code(200).send(payment);
    });
}

export default api;
