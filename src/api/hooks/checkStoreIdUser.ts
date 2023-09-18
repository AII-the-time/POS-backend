import { LoginToken } from '@utils/jwt';
import { PrismaClient } from '@prisma/client';
import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
const prisma = new PrismaClient();
export default async (
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: FastifyError) => void
) => {
  const { authorization, storeid } = request.headers;
  if (!authorization) {
    reply.code(400).send('토큰이 존재하지 않습니다');
    return;
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
    reply.code(401).send('토큰이 유효하지 않습니다');
    return;
  }

  const store = await prisma.store.findFirst({
    where: {
      AND: [{ id: Number(storeid) }, { userId: userId }],
    },
  });
  if (store === null) {
    reply.code(401).send('해당 매장에 대한 권한이 없습니다');
    return;
  }
};
