import { FastifyRequest,FastifyReply,FastifyError} from "fastify";
import { ErrorWithToast } from "@errors";
import ErrorConfig from "@errors/config";
export default (request: FastifyRequest, reply: FastifyReply, error: FastifyError) => {
    if(!(error instanceof ErrorWithToast)){
        return reply.code(500).send();
    }
    const knownError = ErrorConfig.find((config) => error instanceof config.error);
    if(knownError){
        return reply
            .code(knownError.code)
            .send(error.setToast(knownError.toast(error)));
    }
    reply.code(400).send();
};
