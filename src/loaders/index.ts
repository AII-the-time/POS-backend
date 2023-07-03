import { FastifyInstance } from 'fastify';
import api from '../api';

export default async (server: FastifyInstance): Promise<void> => {
    server.register(api);
}