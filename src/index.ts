import fastify from 'fastify';
import loaders from './loaders';
import config from './config';
const server = fastify({logger: true});


const startServer = async () => {
    await loaders(server);
    try {
        await server.listen({port: config.port, host: '0.0.0.0'})
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

startServer();
