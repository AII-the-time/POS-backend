import { FastifyRequest,FastifyReply,FastifyError} from "fastify";
import { NotFoundError} from "@errors";

export default (request: FastifyRequest, reply: FastifyReply, error: FastifyError) => {
    if(error instanceof NotFoundError) {
        reply
            .code(404)
            .send(error.setToast(`${error.missing}을(를) 찾을 수 없습니다.`));
    }

    reply.code(400).send();
};
