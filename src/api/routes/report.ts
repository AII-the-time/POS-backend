import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import onError from '@hooks/onError';
import * as Report from '@DTO/report.dto';
import reportService from '@services/reportService';
import checkStoreIdUser from '@hooks/checkStoreIdUser';

const api: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.get<Report.reportInterface>(
    '/',
    {
      schema: Report.reportSchema,
      onError,
      preValidation: checkStoreIdUser,
    },
    async (request, reply) => {
      const result = await reportService.createReport(request.body);
      reply.code(200).send(result);
    }
  );
};

export default api;
