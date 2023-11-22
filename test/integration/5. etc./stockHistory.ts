import { FastifyInstance } from 'fastify';
import { ErrorInterface } from '@DTO/index.dto';
import testValues from '../testValues';
import * as Stock from '@DTO/stock.dto';
import * as Menu from '@DTO/menu.dto';
import { PrismaClient } from '@prisma/client';
import { expect, test } from '@jest/globals';

const prisma = new PrismaClient();

export default (app: FastifyInstance) => () => {
    test('set history', async () => {
        await prisma.stockHistory.create({
            data: {
              stockId: testValues.coffeeBeanId,
              amount: 1000,
              price: 25000,
              createdAt: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
            },
        });
        await prisma.stockHistory.create({
            data: {
              stockId: testValues.coffeeBeanId,
              amount: 1000,
              price: 26800,
              createdAt: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
            },
        });

        await prisma.stockHistory.create({
            data: {
              stockId: testValues.lemonId,
              amount: 1000,
              price: 5500,
              createdAt: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
            },
        });
        await prisma.stockHistory.create({
            data: {
              stockId: testValues.lemonId,
              amount: 900,
              price: 5900,
              createdAt: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000),
            },
        });

        await prisma.stockHistory.create({
            data: {
              stockId: testValues.sparklingWaterId,
              amount: 100,
              price: 180,
              createdAt: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
            },
        });

        await prisma.stockHistory.create({
            data: {
              stockId: testValues.sparklingWaterId,
              amount: 100,
              price: 171,
              createdAt: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
            },
        });
    });

    test('check stock history', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/stock/${testValues.coffeeBeanId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Stock.getStockInterface['Reply']['200'];
        expect(body.history).toEqual([
            {
                date: expect.any(String),
                amount: 500,
                price: "11900",
            },
            {
                date: expect.any(String),
                amount: 1000,
                price: "25000",
            },
            {
                date: expect.any(String),
                amount: 1000,
                price: "26800",
            },
        ]);

        const response2 = await app.inject({
            method: 'GET',
            url: `/api/stock/${testValues.lemonId}`,
            headers: testValues.storeHeader,
        });
        expect(response2.statusCode).toBe(200);
        const body2 = JSON.parse(response2.body) as Stock.getStockInterface['Reply']['200'];
        expect(body2.history).toEqual([
            {
                date: expect.any(String),
                amount: 1000,
                price: "5000",
            },
            {
                date: expect.any(String),
                amount: 1000,
                price: "5500",
            },
            {
                date: expect.any(String),
                amount: 900,
                price: "5900",
            },
        ]);
    });

    test('check menu history', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.americanoId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body.history).toEqual([
            {
                date: expect.any(String),
                price: "595.00",
            },
            {
                date: expect.any(String),
                price: "625.00",
            },
            {
                date: expect.any(String),
                price: "670.00",
            },
        ]);

        const response2 = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.lemonAdeId}`,
            headers: testValues.storeHeader,
        });
        expect(response2.statusCode).toBe(200);
        const body2 = JSON.parse(response2.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body2.history).toEqual([
            {
                date: expect.any(String),
                price: "403.17",
            },
            {
                date: expect.any(String),
                price: "409.83",
            },
            {
                date: expect.any(String),
                price: "423.91",
            },
        ]);
    });

    test('set stock in mixedstock amout 0', async () => {
        await prisma.stock.update({
            where: {
                id: testValues.lemonId
            },
            data: {
                currentAmount: null
            },
        });
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.lemonAdeId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body.history).toEqual([]);
    });

    test('set mixedstock totalAmount 0', async () => {
        await prisma.mixedStock.update({
            where: {
                id: testValues.preservedLemonId
            },
            data: {
                totalAmount: null
            },
        });
        const response = await app.inject({
            method: 'GET',
            url: `/api/menu/${testValues.lemonAdeId}`,
            headers: testValues.storeHeader,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body) as Menu.getMenuInterface['Reply']['200'];
        expect(body.history).toEqual([]);
    });
};
