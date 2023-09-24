import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, expect, test } from '@jest/globals';
import { LoginToken } from '@utils/jwt';
import * as Order from '@DTO/order.dto';
import * as Mileage from '@DTO/mileage.dto';
import { Prisma } from '@prisma/client';
import test400 from './400test';
import { ErrorInterface } from "@DTO/index.dto";
import seedValues from './seedValues';

let app: FastifyInstance;

const accessToken = new LoginToken(seedValues.user.id).signAccessToken();
beforeAll(async () => {
  app = await server();
});

afterAll(async () => {
  await app.close();
});

test('400 test', async () => {
  await test400(app, [
    ['/api/order', 'POST'],
    ['/api/order', 'GET'],
    ['/api/order/1', 'GET'],
    ['/api/order/pay', 'POST'],
    ['/api/mileage', 'POST'],
    ['/api/mileage', 'GET'],
    ['/api/mileage', 'PATCH'],
  ]);
});

const customerPhone = '010-4321-8765';
let mileageId: number;
test('mileage', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/mileage?phone=${customerPhone}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });

  expect(response.statusCode).toBe(404);
  const body = JSON.parse(
    response.body
  ) as ErrorInterface;
  expect(body.message).toBe('해당하는 마일리지가 없습니다.');
  expect(body.toast).toBe('마일리지을(를) 찾을 수 없습니다.');
});

test('register mileage', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/mileage`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    payload: {
      phone: customerPhone,
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Mileage.registerMileageInterface['Reply']['200'];
  mileageId = body.mileageId;
  expect(body.mileageId).toBeDefined();
});

test('add mileage', async () => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/mileage`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    payload: {
      mileageId: mileageId,
      mileage: 1000,
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Mileage.saveMileageInterface['Reply']['200'];
  expect(body.mileage).toBe('1000');
});

test('get mileage', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/mileage?phone=${customerPhone}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Mileage.getMileageInterface['Reply']['200'];
  expect(body.mileage).toBe('1000');
  expect(body.mileageId).toBe(mileageId);
});

let orderId: number;
test('order', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/order`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    payload: {
      totalPrice: Prisma.Decimal.sum(
        Prisma.Decimal.mul(seedValues.menu[0].price, 2),
        seedValues.menu[1].price
      ),
      menus: [
        {
          id: seedValues.menu[0].id,
          count: 2,
          options: [
            seedValues.option[0].id,
            seedValues.option[2].id,
            seedValues.option[4].id,
          ],
        },
        {
          id: seedValues.menu[1].id,
          count: 1,
          options: [seedValues.option[0].id],
          detail: '얼음 따로 포장해주세요',
        },
      ],
    },
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Order.newOrderInterface['Reply']['200'];
  orderId = body.orderId;
  expect(body.orderId).toBeDefined();
});

test('pay', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/order/pay`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    payload: {
      orderId: orderId,
      paymentMethod: 'CARD',
      mileageId: mileageId,
      useMileage: 500,
      saveMileage: Prisma.Decimal.mul(
        Prisma.Decimal.sum(
          Prisma.Decimal.mul(seedValues.menu[0].price, 2),
          seedValues.menu[1].price,
          -500
        ),
        0.1
      ),
    },
  });

  expect(response.statusCode).toBe(200);
});

//TODO: milage 없는 경우, 이미 결제된 주문을 다시 결제하는 경우 테스트 필요

test('get order', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/order/${orderId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Order.getOrderInterface['Reply']['200'];
  expect(body.paymentStatus).toEqual('PAID');
  expect(body.pay.paymentMethod).toEqual('CARD');
  expect(body.pay.price).toEqual(
    Prisma.Decimal.sum(
      Prisma.Decimal.mul(seedValues.menu[0].price, 2),
      seedValues.menu[1].price,
      -500
    ).toString()
  );
  expect(body.totalPrice).toEqual(
    Prisma.Decimal.sum(
      Prisma.Decimal.mul(seedValues.menu[0].price, 2),
      seedValues.menu[1].price
    ).toString()
  );
  expect(body.mileage).toBeDefined();
  if (body.mileage === undefined) return;
  expect(body.mileage.mileageId).toEqual(mileageId);
  expect(body.mileage.use).toEqual('500');
  expect(body.mileage.save).toEqual(
    Prisma.Decimal.mul(
      Prisma.Decimal.sum(
        Prisma.Decimal.mul(seedValues.menu[0].price, 2),
        seedValues.menu[1].price,
        -500
      ),
      0.1
    ).toString()
  );
});

test('get order list', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/order?page=1&count=10&date=2023-09-18T10:01:12.301Z`,

    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Order.getOrderListInterface['Reply']['200'];
  if (body.orders.length === 0) return;
  expect(body.orders.length).toBeGreaterThan(0);
  const order = body.orders[0];
  expect(order.orderId).toEqual(orderId);
  expect(order.totalCount).toEqual(3);
});
