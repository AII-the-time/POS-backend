import { LoginToken } from '@utils/jwt';
import { StoreAuthorizationHeader } from '@DTO/index.dto';
import { FromSchema } from 'json-schema-to-ts';
import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';

export default {
  async checkUser(
    request: FastifyRequest,
    reply: FastifyReply,
    done: (err?: FastifyError) => void
  ) {
    const authorization = request.headers.authorization;
    console.log('authorization', authorization);
    if (!authorization) {
      reply.code(400).send('토큰이 존재하지 않습니다');
      return;
    }
    const replace_authorization = authorization.replace('Bearer ', '');

    let userId: number;
    try {
      userId = LoginToken.getUserId(replace_authorization);
    } catch (e) {
      reply.code(400).send('토큰이 유효하지 않습니다');
    }
  },
};
