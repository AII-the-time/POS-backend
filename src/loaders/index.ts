import { FastifyInstance } from 'fastify';
import { initEnvFromDotEnv } from '../config';
import api from '../api';

export default async (server: FastifyInstance): Promise<void> => {
    initEnvFromDotEnv();
    console.log(process.env.NODE_ENV);
    console.log(process.env.PORT);
    server.register(api);
}
