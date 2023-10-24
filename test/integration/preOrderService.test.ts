import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { CertificatedPhoneToken, LoginToken } from '@utils/jwt';
import * as PreOrder from '@DTO/preOrder.dto';
import * as Order from '@DTO/order.dto';
import { Prisma } from '@prisma/client';
import test400 from './400test';
import seedValues from './seedValues';
import { ErrorInterface } from '@DTO/index.dto';

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
    ['/api/preorder', 'POST'],
    ['/api/preorder', 'GET'],
    ['/api/preorder/1', 'GET'],
  ]);
});

const preOrderCustomerPhone = '01074185263';
const current = () => new Date().toISOString();
let preOrderId: number;
test('preOrder', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/preorder`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    payload: {
      phone: preOrderCustomerPhone,
      memo: '얼음 따로 포장해주세요',
      orderedFor: current(),
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
  ) as PreOrder.newPreOrderInterface['Reply']['200'];
  preOrderId = body.preOrderId;
  expect(body.preOrderId).toBeDefined();
});

let preOrderWithoutMemoId: number;
test('preOrder without memo', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/preorder`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    payload: {
      phone: preOrderCustomerPhone,
      orderedFor: current(),
      totalPrice: Prisma.Decimal.mul(seedValues.menu[0].price, 3),
      menus: [
        {
          id: seedValues.menu[0].id,
          count: 3,
          options: [
            seedValues.option[0].id,
            seedValues.option[2].id,
            seedValues.option[4].id,
          ],
        },
      ],
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as PreOrder.newPreOrderInterface['Reply']['200'];
  expect(body.preOrderId).toBeDefined();
  preOrderWithoutMemoId = body.preOrderId;
});

let preOrderId2: number;
test('preOrder 2', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/preorder`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store2.id.toString(),
    },
    payload: {
      phone: preOrderCustomerPhone,
      memo: '얼음 따로 포장해주세요',
      orderedFor: current(),
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
  ) as PreOrder.newPreOrderInterface['Reply']['200'];
  preOrderId2 = body.preOrderId;
  expect(body.preOrderId).toBeDefined();
});

let preOrderData: any;
test('get preOrder', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/preorder/${preOrderId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as PreOrder.getPreOrderInterface['Reply']['200'];
  preOrderData = body;
  expect(body.totalPrice).toEqual(
    Prisma.Decimal.sum(
      Prisma.Decimal.mul(seedValues.menu[0].price, 2),
      seedValues.menu[1].price
    ).toString()
  );
});

test('get preOrder without memo', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/preorder/${preOrderWithoutMemoId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as PreOrder.getPreOrderInterface['Reply']['200'];
  expect(body.totalPrice).toEqual(
    Prisma.Decimal.mul(seedValues.menu[0].price, 3).toString()
  );
  expect(body.memo).toEqual('');
});

test('get not exist preOrder', async () => {
  // preOrderService.test 에서 getPreOrder에서 preOrder가 없을 때 에러 발생
  const response = await app.inject({
    method: 'GET',
    url: `/api/preorder/${100}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(404);
  const body = JSON.parse(response.body) as ErrorInterface;
  expect(body.message).toEqual('해당하는 예약 주문이 없습니다.');
});

test('get exist preOrder but wrong storeId', async () => {
  // preOrderService.test 에서 getPreOrder에서 preOrder가 없을 때 에러 발생
  const response = await app.inject({
    method: 'GET',
    url: `/api/preorder/${preOrderId2}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(404);
  const body = JSON.parse(response.body) as ErrorInterface;
  expect(body.message).toEqual('해당하는 예약 주문이 없습니다.');
});

test('update preOrder2', async () => {
  const response = await app.inject({
    method: 'PUT',
    url: `/api/preorder`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store2.id.toString(),
    },
    payload: {
      id: preOrderId2,
      phone: preOrderCustomerPhone,
      memo: '테스트 변경',
      orderedFor: current(),
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
          detail: '테스트 변경',
        },
      ],
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as PreOrder.updatePreOrderInterface['Reply']['201'];
  expect(body).toEqual({ preOrderId: preOrderId2 });
});

test('soft delete preOrder2', async () => {
  const response = await app.inject({
    method: 'PUT',
    url: `/api/preorder/${preOrderId2}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store2.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as PreOrder.softDeletePreOrderInterface['Reply']['200'];
  expect(body).toEqual({ preOrderId: preOrderId2 });
});

test('get preorder list', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/preorder?page=1&count=10&date=${current()}`,

    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as PreOrder.getPreOrderListInterface['Reply']['200'];
  expect(body.preOrders.length).toBeGreaterThan(1);
  const order = body.preOrders[1];
  expect(order.preOrderId).toEqual(preOrderId);
  expect(order.totalCount).toEqual(3);
});

test('get preorder list without options', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/preorder`,

    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as PreOrder.getPreOrderListInterface['Reply']['200'];
  if (body.preOrders.length === 0) return;
  expect(body.preOrders.length).toBeGreaterThan(1);
  const order = body.preOrders[1];
  expect(order.preOrderId).toEqual(preOrderId);
  expect(order.totalPrice).toEqual(
    Prisma.Decimal.sum(
      Prisma.Decimal.mul(seedValues.menu[0].price, 2),
      seedValues.menu[1].price
    ).toString()
  );
});

test('preOrder to order', async () => {
  const orderMenus = preOrderData.orderitems.map((item: any) => {
    let optionList: any[] = [];
    item.options.forEach((option: any) => {
      optionList.push(option.id);
    });
    item.options = optionList;
    return item;
  }); //각 options의 id만 배열로 바꿔줌
  const response = await app.inject({
    method: 'POST',
    url: `/api/order`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    payload: {
      preOrderId: preOrderId,
      totalPrice: preOrderData.totalPrice,
      menus: orderMenus,
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Order.newOrderInterface['Reply']['200'];
  expect(body.orderId).toBeDefined();
});

test('get preOrder list after order', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/preorder?page=1&count=10&date=${current()}`,

    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as PreOrder.getPreOrderListInterface['Reply']['200'];
  expect(body.preOrders.length).toEqual(1);
  const order = body.preOrders[0];
  expect(order.preOrderId).toEqual(preOrderWithoutMemoId);
  expect(order.totalPrice).toEqual(
    Prisma.Decimal.mul(seedValues.menu[0].price, 3).toString()
  );
});
