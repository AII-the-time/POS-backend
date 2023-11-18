import { FastifyInstance } from 'fastify';
import { afterAll, describe} from '@jest/globals';
import updateExceptStock from './updateExceptStock';
import checkAboutMenu from './checkAboutMenu';


const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['update except order, preorder', updateExceptStock],
    ['check after update about menu', checkAboutMenu],
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
