import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { ErrorWithToast, ValidationError } from '@errors';
import ErrorConfig from '@errors/config';
export default (
  request: FastifyRequest,
  reply: FastifyReply,
  error: FastifyError & { toast?: string }
) => {
  if (!(error instanceof ErrorWithToast)) {
    if (error.validation) {
      error.toast = ErrorConfig.find(
        (config) => config.error === ValidationError
      )!.toast(error);
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
  // test 폴더에 있는 hookTest.test.ts 파일에서 test
  // test 이름은 human error
};
