import fastify from 'fastify';
import loaders from './loaders';
const server = fastify({logger: true});


const startServer = async () => {
    await loaders(server);
    try {
        await server.listen({port: 3000})
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

startServer();