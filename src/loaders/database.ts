import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}

const database = fp(async (server: FastifyInstance) => {
    const prisma = new PrismaClient();
    server.decorate('prisma', prisma);
    server.addHook('onClose', async (fastifyInstance) => {
        fastifyInstance.prisma.$disconnect();
    });
});

export default database;
