import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '@errors';
import * as Report from '@DTO/report.dto';

const prisma = new PrismaClient();

export default {
    async createReport({ storeId }: Report.reportInterface['Body']): Promise<Report.reportInterface['Reply']['200']>{
        const reportList = [] as Report.reportInterface['Reply']['200']['responseData']['viewContetns'];
        const today = new Date();
        
        reportList.push(await this.monthlyReport(storeId, today));
        if(today.getDate() < 7){
            const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            reportList.push(await this.monthlyReport(storeId, lastMonthDate));
        }


        return {
            responseData: {
                screenName: 'report',
                viewContetns: reportList
            }
        }
    },

    async monthlyReport(storeId: number,date:Date): Promise<{viewType:"CALENDAR",content:Report.calenderInterface}> {
        
        return {
            viewType:"CALENDAR",
            content: {
                "calendarTitle": "해든카페 2023년 11월 매출",
                "calendarDate": new Date("2023-11-01T00:00:00.000Z"),
                "calendarItems": []
            }
        }
    }
};
