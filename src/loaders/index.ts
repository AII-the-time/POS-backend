import { FastifyInstance } from 'fastify';
import { initEnvFromDotEnv } from '@config';
import api from '@api';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

export default async (server: FastifyInstance): Promise<void> => {
    initEnvFromDotEnv();
    server.register(swagger, {
        prefix: '/docs',
        swagger: {
            info: {
                title: 'Fastify API',
                description: 'Building a blazing fast REST API with Node.js, MongoDB, Fastify and Swagger',
                version: '0.1.0'
            },
            host: 'localhost:3000',
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json']
        }
    });
    server.register(swaggerUI, {
        prefix: '/docs',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false,
        },
        uiHooks: {
            onRequest: (request, reply, next) => {
                next();
            }
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
        transformSpecificationClone: true
    });

    server.register(api, { prefix: '/api' });
}
