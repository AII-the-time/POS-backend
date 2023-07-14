import { FastifyInstance,FastifyPluginAsync } from "fastify";
import menu from './menu';
import payment from './payment';

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.get('/ping', async (req, res) => {
        return {data:'pong'};
    });
    server.register(menu, {prefix: '/menu'});
    server.register(payment, {prefix: '/payment'});
}

export default api;
