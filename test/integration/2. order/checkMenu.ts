import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import { LoginToken } from '@utils/jwt';
import { expect, test } from '@jest/globals';

export default (app: FastifyInstance) => () => {
    const accessToken = new LoginToken(1).signAccessToken();
}
