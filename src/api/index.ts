import { FastifyInstance,FastifyPluginAsync } from "fastify";
import menuService from "../services/menuService";

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.get('/ping', async (request, reply) => {
        return {data:'pong'};
    });
    server.get('/menu', async (request, reply) => {
        const menu = await server.prisma.menu.findMany();
        return {data:menu};
        // const menu = await menuService.getMenu();
        // return {data:menu};
    });
}

export default api;
