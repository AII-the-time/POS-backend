import { LoginToken } from '@utils/jwt';
import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';

export default async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: FastifyError) => void
) => {
  const authorization = request.headers.authorization;
  if (!authorization) {
    reply.code(400).send('토큰이 존재하지 않습니다');
    return;
  }

  const replace_authorization = authorization.replace('Bearer ', '');

  try {
    const userId = LoginToken.getUserId(replace_authorization);
    request.headers = {
      ...request.headers,
      userid: userId + '',
    };
  } catch (e) {
    reply.code(401).send('토큰이 유효하지 않습니다');
  }
};
