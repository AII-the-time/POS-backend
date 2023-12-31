import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ErrorWithToast, ValidationError } from '@errors';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import ErrorConfig from '@errors/config';
import * as Sentry from "@sentry/node";

export default (
  request: FastifyRequest,
  reply: FastifyReply,
  error: FastifyError & { toast?: string }
) => {
  Sentry.captureException(error);
  if (!(error instanceof ErrorWithToast)) {
    if (error.validation) {
      error.toast = ErrorConfig.find(
        (config) => config.error === ValidationError
      )!.toast(error);
      return reply.code(400).send(error);
    }
    if(error as FastifyError & { toast?: string } instanceof PrismaClientKnownRequestError) {
      if(error.code === 'P2025') {
        error.toast = '찾을 수 없는 데이터가 포함되어 있습니다.';
        return reply.code(404).send(error);
      }
      error.toast = '잘못된 데이터가 입력되었습니다.';
      return reply.code(400).send(error);
    }
    error.toast = '알 수 없는 에러가 발생했습니다.';
    return reply.code(500).send(error);
  }
  const knownError = ErrorConfig.find(
    (config) => error instanceof config.error
  );
  if (knownError) {
    return reply
      .code(knownError.code)
      .send(error.setToast(knownError.toast(error)));
  }
  
  reply.code(500).send();
};
