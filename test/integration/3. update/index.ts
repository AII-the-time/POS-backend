import { FastifyInstance } from 'fastify';
import { afterAll, describe} from '@jest/globals';
import updateStock from './updateStock';
import updateMenu from './updateMenu';
import updatePreOrder from './updatePreOrder';
import checkAfterUpdate from './checkAfterUpdate';


const tests:[string, (app: FastifyInstance) => () => void][] = [
    ['update about stock', updateStock],
    ['update about menu', updateMenu],
    ['update preorder', updatePreOrder],
    ['check after update about menu', checkAfterUpdate],
];

export default (app: FastifyInstance) => () => {
    tests.forEach(([name, test]) => {
        describe(name, test(app));
    });
};
