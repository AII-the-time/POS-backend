import fastify, {FastifyInstance} from 'fastify';
import loaders from './loaders';

const serverSetting = async () : Promise <FastifyInstance> => {
    const server = fastify({logger: process.env.NODE_ENV === 'development'});
    await loaders(server);
    return server;
}

export default serverSetting;
