import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import userService from '@services/userService';
import onError from "@hooks/onError";
import * as User from '@DTO/user.dto';
import checkUser from '@hooks/checkUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<User.phoneInterface>(
    '/phone',
    { onError, schema: User.phoneSchema },
    async (request, reply) => {
      const result = await userService.sendCertificationCode(request.body);
      reply.code(200).send(result);
    }
  );

  server.post<User.certificatePhoneInterface>(
    '/phone/certificationCode',
    { onError,schema: User.certificatePhoneSchema },
    async (request, reply) => {
      const result = await userService.certificatePhone(request.body);
      reply.code(200).send(result);
    }
  );

  server.post<User.loginInterface>(
    '/login',
    { onError, schema: User.loginSchema },
    async (request, reply) => {
      const result = await userService.login(request.body);
      reply.code(200).send(result);
    }
  );

  server.post<User.refreshInterface>(
    '/refresh',
    {
      schema: User.refreshSchema, onError,
      preValidation: checkUser,
    },
    async (request, reply) => {
      const result = await userService.refresh({
        userid: Number(request.headers.userid),
      });
      reply.code(200).send(result);
    }
  );
};

export default api;
