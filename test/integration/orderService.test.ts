import server from '../../src/server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { CertificatedPhoneToken, LoginToken } from '../../src/utils/jwt';
import userService from '../../src/services/userService';
import storeService from '../../src/services/storeService';
import menuService from '../../src/services/menuService';
import * as Menu from '../../src/DTO/menu.dto';
import * as Order from '../../src/DTO/order.dto';
import * as Mileage from '../../src/DTO/mileage.dto';
import { Prisma } from '@prisma/client';
import test400 from './400test';
import { ErrorInterface } from '../../src/DTO/index.dto';

let app: FastifyInstance;

const phone = '010-1234-5678';
const businessRegistrationNumber = '0123456789';
let accessToken: string;
let storeId: number;
let menus: Menu.getMenuListInterface['Reply']['200']['categories'][0]['menus'];
beforeAll(async () => {
  app = await server();
  const certificatedPhoneToken = new CertificatedPhoneToken(phone).sign();
  accessToken = (
    await userService.login({
      businessRegistrationNumber,
      certificatedPhoneToken,
    })
  ).accessToken;
  const userid = LoginToken.getUserId(accessToken);
  storeId = (await storeService.getStoreList({ userid })).stores[0].storeId;
  menus = (
    await menuService.getMenus({
      storeid: storeId,
    })
  ).categories.flatMap((category) => category.menus);
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
const existPhone = '010-1234-5678';
const notCorrectPhone = '010-1234-567';
let mileageId: number;
test('mileage', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/mileage?phone=${customerPhone}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: storeId.toString(),
    },
  });

  expect(response.statusCode).toBe(404);
  const body = JSON.parse(response.body) as ErrorInterface;
  expect(body.message).toBe('해당하는 마일리지가 없습니다.');
  expect(body.toast).toBe('마일리지을(를) 찾을 수 없습니다.');
});

test('register mileage', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/mileage`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: storeId.toString(),
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

test('register mileage with not correct phone check', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/mileage`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: storeId.toString(),
    },
    payload: {
      phone: notCorrectPhone,
    },
  });
  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body) as ErrorInterface;
  expect(body.message).toBe('입력된 전화번호이(가) 양식과 맞지 않습니다.');
});

test('exist mileage check', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/mileage`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: storeId.toString(),
    },
    payload: {
      phone: existPhone,
    },
  });
  expect(response.statusCode).toBe(409);
  const body = JSON.parse(response.body) as ErrorInterface;
  console.log(body);
  expect(body.message).toBe('입력된 전화번호가 이미 존재합니다.');
  expect(body.toast).toBe('입력된 전화번호가 이미 존재합니다.');
});

test('add mileage', async () => {
  const response = await app.inject({
    method: 'PATCH',
    url: `/api/mileage`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: storeId.toString(),
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
      storeid: storeId.toString(),
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
      storeid: storeId.toString(),
    },
    payload: {
      totalPrice: Prisma.Decimal.sum(
        Prisma.Decimal.mul(menus[0].price, 2),
        menus[1].price
      ),
      menus: [
        {
          id: menus[0].id,
          count: 2,
          options: [
            menus[0].option[0].options[0].id,
            menus[0].option[1].options[1].id,
            menus[0].option[2].options[0].id,
          ],
        },
        {
          id: menus[1].id,
          count: 1,
          options: [menus[1].option[0].options[0].id],
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
      storeid: storeId.toString(),
    },
    payload: {
      orderId: orderId,
      paymentMethod: 'CARD',
      mileageId: mileageId,
      useMileage: 500,
      saveMileage: Prisma.Decimal.mul(
        Prisma.Decimal.sum(
          Prisma.Decimal.mul(menus[0].price, 2),
          menus[1].price,
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
      storeid: storeId.toString(),
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
      Prisma.Decimal.mul(menus[0].price, 2),
      menus[1].price,
      -500
    ).toString()
  );
  expect(body.totalPrice).toEqual(
    Prisma.Decimal.sum(
      Prisma.Decimal.mul(menus[0].price, 2),
      menus[1].price
    ).toString()
  );
  expect(body.mileage).toBeDefined();
  if (body.mileage === undefined) return;
  expect(body.mileage.mileageId).toEqual(mileageId);
  expect(body.mileage.use).toEqual('500');
  expect(body.mileage.save).toEqual(
    Prisma.Decimal.mul(
      Prisma.Decimal.sum(
        Prisma.Decimal.mul(menus[0].price, 2),
        menus[1].price,
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
      storeid: storeId.toString(),
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
