import { FastifyInstance,FastifyPluginAsync } from "fastify";
import menu from './menu';
import order from './order';
import user from './user';
import store from './store';
import mileage from './mileage';

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    server.get('/ping', async (req, res) => {
        return {data:'pong'};
    });
    server.register(menu, {prefix: '/menu'});
    server.register(order, {prefix: '/order'});
    server.register(user, {prefix: '/user'});
    server.register(store, {prefix: '/store'});
    server.register(mileage, {prefix: '/mileage'});
}

export default api;
