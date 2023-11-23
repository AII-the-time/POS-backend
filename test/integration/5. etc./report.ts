import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import * as Report from '@DTO/report.dto';
import testValues from '../testValues';
import { PrismaClient } from '@prisma/client';
import { expect, test, beforeAll } from '@jest/globals';

const prisma = new PrismaClient();

export default (app: FastifyInstance) => () => {
    test('get report', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/report`,
            headers: testValues.testStoreHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Report.reportInterface['Reply']['200'];
        console.log(JSON.stringify(body.responseData.viewContents, null, 2));
        const recentSalesReport = body.responseData.viewContents[0].content as unknown as Report.graphInterface;
        expect(recentSalesReport.graphTitle).toBe('최근 30일 매출');
        expect(recentSalesReport.graphColor).toBe('#2B1E12');
        expect(recentSalesReport.graphItems.length).toBeGreaterThan(0);

        const salesReportByTime = body.responseData.viewContents[1].content as unknown as Report.graphInterface;
        expect(salesReportByTime.graphTitle).toBe('최근 30일 시간대별 매출');
        expect(salesReportByTime.graphColor).toBe('#2B1E12');
        expect(salesReportByTime.graphItems.length).toBeGreaterThan(0);

        const returnRateReport = body.responseData.viewContents[2].content as unknown as Report.pieChartInterface;
        expect(returnRateReport.pieChartTitle).toBe('재방문율');
        expect(returnRateReport.totalCount).toBe(250);
        expect(returnRateReport.pieChartItems.length).toBe(6);
    });

    test('get report', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/report`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Report.reportInterface['Reply']['200'];
        expect(body.responseData.viewContents.length).toBe(1);
        const textReport = body.responseData.viewContents[0].content as unknown as Report.textInterface;
        expect(body.responseData.viewContents[0].viewType).toBe('TEXT');
        expect(textReport).toHaveProperty('textItems');
        expect(textReport.textItems.length).toBe(1);
        expect(textReport.textItems[0].text).toBe('최소 3일 이상의 주문 데이터가 필요합니다.');
    });
};
