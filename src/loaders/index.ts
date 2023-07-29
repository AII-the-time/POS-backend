import { FastifyInstance } from 'fastify';
import { initEnvFromDotEnv } from '../config';
import api from '../api';

export default async (server: FastifyInstance): Promise<void> => {
    initEnvFromDotEnv();
    server.register(api, { prefix: '/api' });
}
