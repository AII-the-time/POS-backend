import { LoginToken } from '@utils/jwt';
import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { UserAuthorizationError, NoAuthorizationInHeaderError } from '@errors/index';

export default async (
  request: FastifyRequest<{ Body: { userId: number } }>,
  reply: FastifyReply,
  done: (err?: FastifyError) => void
) => {
  const authorization = request.headers.authorization;
  if (!authorization) {
    throw new NoAuthorizationInHeaderError('헤더에 Authorization이 없습니다');
  }

  const replace_authorization = authorization.replace('Bearer ', '');

  if(!request.body)
    request.body = { userId: 0 };
  request.body.userId = LoginToken.getUserId(replace_authorization);
};
