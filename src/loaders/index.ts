import { FastifyInstance } from 'fastify';
import { initEnvFromDotEnv } from '../config';
import api from '../api';
import database from './database';

export default async (server: FastifyInstance): Promise<void> => {
    initEnvFromDotEnv();
    server.register(api);
    server.register(database);
}
