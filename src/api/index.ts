import { FastifyInstance,FastifyPluginAsync } from "fastify";
import menu from './menu';
import payment from './payment';
import user from './user';

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.get('/ping', async (req, res) => {
        return {data:'pong'};
    });
    server.register(menu, {prefix: '/menu'});
    server.register(payment, {prefix: '/payment'});
    server.register(user, {prefix: '/user'});
}

export default api;
