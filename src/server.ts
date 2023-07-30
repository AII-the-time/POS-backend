import fastify, {FastifyInstance} from 'fastify';
import loaders from './loaders';

const serverSetting = async () : Promise <FastifyInstance> => {
    const server = fastify({logger: true});
    await loaders(server);
    return server;
}

export default serverSetting;
