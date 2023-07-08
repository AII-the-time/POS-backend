import fastify, {FastifyInstance} from 'fastify';
import loaders from './loaders';
import config from './config';


const serverSetting = async () : Promise <FastifyInstance> => {
    const server = fastify({logger: true});
    await loaders(server);
    return server;
}

const startServer = async (server : FastifyInstance) => {
    try {
        await server.listen({port: config.port, host: '0.0.0.0'})
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

(async () => {
    const settedServer:FastifyInstance = await serverSetting();
    startServer(settedServer);
})();

export default serverSetting;
