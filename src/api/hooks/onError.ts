import { FastifyRequest,FastifyReply,FastifyError} from "fastify";
import { NotFoundError } from "@errors";

export default (request: FastifyRequest, reply: FastifyReply, error: FastifyError) => {
    if(error instanceof NotFoundError) {
        console.log(request.url, error);
        reply
            .code(404)
            .send(error);
    }

    reply.code(400).send({
        "message": "unknown error",
        "toast": "알 수 없는 에러가 발생했습니다."
    });
};
