import { FastifyRequest,FastifyReply,FastifyError} from "fastify";
import * as E from "@errors";

export default (request: FastifyRequest, reply: FastifyReply, error: FastifyError) => {
    if(error instanceof E.NotFoundError) {
        reply
            .code(404)
            .send(error.setToast(`${error.missing}을(를) 찾을 수 없습니다.`));
    }
    if(error instanceof E.UserAuthorizationError) {
        reply
            .code(401)
            .send(error.setToast(`다시 로그인 해주세요.`));
    }
    if(error instanceof E.StoreAuthorizationError) {
        reply
            .code(401)
            .send(error.setToast(`가게 접근 권한이 없습니다.`));
    }
    if(error instanceof E.NoAuthorizationInHeaderError) {
        reply
            .code(400)
            .send(error.setToast(`인증 정보가 없습니다.`));
    }
    reply.code(400).send();
};
