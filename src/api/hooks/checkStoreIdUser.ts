import { LoginToken } from '@utils/jwt';
import { PrismaClient } from '@prisma/client';
import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import {
  UserAuthorizationError,
  StoreAuthorizationError,
  NoAuthorizationInHeaderError,
} from '@errors/index';

const prisma = new PrismaClient();
export default async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: FastifyError) => void
) => {
  const { authorization, storeid } = request.headers;
  if (!authorization) {
    throw new NoAuthorizationInHeaderError('헤더에 Authorization이 없습니다');
  }
  if (!storeid) {
    throw new NoAuthorizationInHeaderError('헤더에 storeid가 없습니다');
    // 해당 에러는 test 중 orderService.test.ts 에서 테스트 함.
  }
  const replace_authorization = authorization.replace('Bearer ', '');
  let userId: number;
  try {
    userId = LoginToken.getUserId(replace_authorization);
    request.headers = {
      ...request.headers,
      userid: userId + '',
    };
  } catch (e) {
    throw new UserAuthorizationError('유저 인증에 실패했습니다');
  }

  const store = await prisma.store.findFirst({
    where: {
      AND: [{ id: Number(storeid) }, { userId: userId }],
    },
  });
  if (store === null) {
    throw new StoreAuthorizationError('가게 인증에 실패했습니다');
  }
};
