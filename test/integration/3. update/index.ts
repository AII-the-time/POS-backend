import { FastifyInstance } from 'fastify';
import { afterAll, describe} from '@jest/globals';


const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['update stock', ()=>()=>{}],
    ['update mixed stock', ()=>()=>{}],
    ['check stock, mixed stock, menu', ()=>()=>{}],
    ['update menu, category, option', ()=>()=>{}],
    ['check stock, mixed stock, menu, category, order, preorder, option', ()=>()=>{}],
    ['update preorder + check', ()=>()=>{}],
    ['update order', ()=>()=>{}],
    ['check stock, menu, order, option', ()=>()=>{}],
];

export default (app: FastifyInstance) => () => {
    tests.forEach(([name, test]) => {
        describe(name, test(app));
    });
};
