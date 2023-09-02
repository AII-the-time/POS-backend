import { FastifyInstance,FastifyPluginAsync,FastifySchema } from "fastify";
import menu from './menu';
import order from './order';
import user from './user';
import store from './store';
import mileage from './mileage';

const api: FastifyPluginAsync =  async (server: FastifyInstance) => {
    const testSchema: FastifySchema = {
        response: {
            200: {
                type: 'object',
                properties: {
                    data: { type: 'string' }
                }
            }
        }
    };
    server.get('/ping', { schema: testSchema }, async (req, res) => {
        return { data: 'pong' };
    });
    server.register(menu, {prefix: '/menu'});
    server.register(order, {prefix: '/order'});
    server.register(user, {prefix: '/user'});
    server.register(store, {prefix: '/store'});
    server.register(mileage, {prefix: '/mileage'});
}

export default api;
