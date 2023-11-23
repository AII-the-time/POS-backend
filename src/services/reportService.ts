import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '@errors';
import * as Report from '@DTO/report.dto';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

export default {
    async createReport({ storeId }: Report.reportInterface['Body']): Promise<Report.reportInterface['Reply']['200']>{
        const totalPriceByDate = await this.getTotalPriceByDate(storeId);
        if(Object.keys(totalPriceByDate).length < 3){
            return {
                responseData: {
                    screenName: 'report',
                    viewContents: [
                        {
                            viewType:"TEXT",
                            content: {
                                align: "CENTER",
                                textItems: [
                                    {
                                        text: "최소 3일 이상의 주문 데이터가 필요합니다.",
                                        color: "#000000",
                                        size: 20,
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        }

        
        const reportList = [] as Report.reportInterface['Reply']['200']['responseData']['viewContents'];
        reportList.push(await this.recentSalesReport(totalPriceByDate));
        reportList.push(await this.salesReportByTime(storeId));
        reportList.push(await this.returnRateReport(storeId));
        reportList.push(await this.reservedSalesReport(storeId));

        return {
            responseData: {
                screenName: 'report',
                viewContents: reportList
            }
        }
    },
    async getTotalPriceByDate(storeId: number) {
        const orderList = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30))
                },
                paymentStatus: "PAID"
            },
            select: {
                createdAt: true,
                totalPrice: true
            }
        });

        const totalPriceByDate = orderList.reduce((acc, cur) => {
            const date = cur.createdAt.toISOString().split('T')[0];
            if(acc[date]){
                acc[date] = acc[date].add(cur.totalPrice);
            } else {
                acc[date] = cur.totalPrice;
            }
            return acc;
        }, {} as {[key:string]:Decimal});
        return totalPriceByDate;
    },
    async recentSalesReport(totalPriceByDate: {[key:string]:Decimal}): Promise<{viewType:"GRAPH",content:Report.graphInterface}>{
        const graphItems = Object.keys(totalPriceByDate).sort().map(date => {
            return {
                graphKey: date,
                graphValue: totalPriceByDate[date].toNumber()
            }
        });

        return {
            viewType:"GRAPH",
            content: {
                graphTitle: "최근 30일 매출",
                graphColor: "#2B1E12",
                graphItems,
            }
        }
    },

    async salesReportByTime(storeId: number): Promise<{viewType:"GRAPH",content:Report.graphInterface}>{
        const orderList = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30))
                },
                paymentStatus: "PAID"
            },
            select: {
                createdAt: true,
                totalPrice: true
            }
        });

        const totalPriceByTime = orderList.reduce((acc, cur) => {
            const time = cur.createdAt.toISOString().split('T')[1].split(':')[0];
            if(acc[time]){
                acc[time] = acc[time].add(cur.totalPrice);
            } else {
                acc[time] = cur.totalPrice;
            }
            return acc;
        }, {} as {[key:string]:Decimal});
        const graphItems = Object.keys(totalPriceByTime).sort().map(time => {
            return {
                graphKey: `${parseInt(time)+9}~${parseInt(time)+10}시`,
                graphValue: totalPriceByTime[time].toNumber()
            }
        });
        return {
            viewType:"GRAPH",
            content: {
                graphTitle: "최근 30일 시간대별 매출",
                graphColor: "#2B1E12",
                graphItems,
            }
        }
    },

    async returnRateReport(storeId: number): Promise<{viewType:"PIECHART",content:Report.pieChartInterface}>{
        const orderList = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30))
                },
                paymentStatus: "PAID"
            },
            select: {
                mileageId: true,
            }
        });

        const returnUserList = orderList.reduce((acc, cur) => {
            if(cur.mileageId){
                acc[cur.mileageId] = acc[cur.mileageId] ? acc[cur.mileageId] + 1 : 1;
            }
            else {
                acc['null']++;
            }
            return acc;
        }, {'null':0} as {[key:number|string]:number});


        const nullCount = returnUserList['null'];
        delete returnUserList['null'];
        const returnCount = [1,2,3,4].map((returnCount)=>Object.values(returnUserList).filter(count => count === returnCount).length);
        const returnCountOver5 = Object.values(returnUserList).filter(count => count >= 5).length;

        return {
            viewType:"PIECHART",
            content: {
                pieChartTitle: "재방문율",
                totalCount: orderList.length,
                pieChartItems: [
                    {
                        categoryName: "정보없음",
                        categoryCount: nullCount,
                        charColor: "#cccccc",
                    },
                    ...returnCount.map((count, index) => ({
                        categoryName: `${index+1}회`,
                        categoryCount: count,
                        charColor: ["#F2D0A7", "#E6B89C", "#d49870", "#cf7544"][index],
                    })),
                    {
                        categoryName: "5회 이상",
                        categoryCount: returnCountOver5,
                        charColor: "#b54d16"
                    }
                ],
            }
        }
    },

    async reservedSalesReport(storeId: number): Promise<{viewType:"PIECHART",content:Report.pieChartInterface}>{
        const orderList = await prisma.order.findMany({
            where: {
                storeId,
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 30))
                },
                paymentStatus: "PAID"
            },
            select: {
                createdAt: true,
                preOrderId: true,
                totalPrice: true
            }
        });

        const nonReservedPrice = orderList.reduce((acc, cur) => {
            if(!cur.preOrderId){
                acc = acc.add(cur.totalPrice);
            }
            return acc;
        }, new Decimal(0));
        const reservedPrice = orderList.reduce((acc, cur) => {
            if(cur.preOrderId){
                acc = acc.add(cur.totalPrice);
            }
            return acc;
        }, new Decimal(0));

        return {
            viewType:"PIECHART",
            content: {
                pieChartTitle: "예약 매출",
                totalCount: reservedPrice.add(nonReservedPrice).toNumber(),
                pieChartItems: [
                    {
                        categoryName: "예약",
                        categoryCount: reservedPrice.toNumber(),
                        charColor: "#1cbeff",
                    },
                    {
                        categoryName: "비예약",
                        categoryCount: nonReservedPrice.toNumber(),
                        charColor: "#a1e4ff",
                    },
                ],
            }
        }
    }
};
