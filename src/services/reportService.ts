import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '@errors';
import * as Report from '@DTO/report.dto';

const prisma = new PrismaClient();

export default {
    async createReport({ storeId }: Report.reportInterface['Body']): Promise<Report.reportInterface['Reply']['200']>{
        

        return {
            responseData: {
                screenName: 'report',
                viewContetns: [],
            }
        }
    }
};
