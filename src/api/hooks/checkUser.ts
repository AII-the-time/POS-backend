import { LoginToken } from '@utils/jwt';
import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { UserAuthorizationError, NoAuthorizationInHeaderError } from '@errors/index';

export default async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: FastifyError) => void
) => {
  const authorization = request.headers.authorization;
  if (!authorization) {
    throw new NoAuthorizationInHeaderError('헤더에 Authorization이 없습니다');
  }

  const replace_authorization = authorization.replace('Bearer ', '');

  try {
    const userId = LoginToken.getUserId(replace_authorization);
    request.headers = {
      ...request.headers,
      userid: userId + '',
    };
  } catch (e) {
    throw new UserAuthorizationError('유저 인증에 실패했습니다');
  }
};
