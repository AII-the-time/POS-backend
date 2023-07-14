import { FastifyInstance } from "fastify";

export default {
    async getMenus(server: FastifyInstance,storeId:number): Promise<Array<Object>>{
        console.log("asdf");
        const menus = await server.prisma.menu.findMany({
            where: {
                storeId: storeId
            }
        });
        return menus;
    }
}
