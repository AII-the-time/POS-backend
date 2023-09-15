import { FastifyInstance,FastifyPluginAsync,FastifySchema } from "fastify";
import menu from './routes/menu';
import order from './routes/order';
import user from './routes/user';
import store from './routes/store';
import mileage from './routes/mileage';

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
