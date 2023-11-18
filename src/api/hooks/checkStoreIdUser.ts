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
  request: FastifyRequest<{ Body: { userId: number,storeId: number } }>,
  reply: FastifyReply,
  done: (err?: FastifyError) => void
) => {
  const { authorization, storeid } = request.headers;
  if (!authorization) {
    throw new NoAuthorizationInHeaderError('헤더에 Authorization이 없습니다');
  }
  if (!storeid) {
    throw new NoAuthorizationInHeaderError('헤더에 storeid가 없습니다');
  }
  const replace_authorization = authorization.replace('Bearer ', '');
  const userId = LoginToken.getUserId(replace_authorization);
  const storeId = Number(storeid);
  
  const store = await prisma.store.findFirst({
    where: {
      AND: [{ id: storeId }, { userId: userId }],
    },
  });
  if (store === null) {
    throw new StoreAuthorizationError('가게 인증에 실패했습니다');
  }

  if(!request.body)
    request.body = { userId: 0, storeId: 0 };
  request.body.userId = userId;
  request.body.storeId = storeId;
};
