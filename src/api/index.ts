import { FastifyInstance, FastifyPluginAsync, FastifySchema } from 'fastify';
import menu from './routes/menu';
import order from './routes/order';
import user from './routes/user';
import store from './routes/store';
import mileage from './routes/mileage';
import preOrder from './routes/preOrder';
import stock from './routes/stock';
import report from './routes/report';
import test from './routes/apiTest';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.register(menu, { prefix: '/menu' });
  server.register(order, { prefix: '/order' });
  server.register(user, { prefix: '/user' });
  server.register(store, { prefix: '/store' });
  server.register(mileage, { prefix: '/mileage' });
  server.register(preOrder, { prefix: '/preorder' });
  server.register(stock, { prefix: '/stock' });
  server.register(report, { prefix: '/report' });
  server.register(test, { prefix: '/' });
};

export default api;
