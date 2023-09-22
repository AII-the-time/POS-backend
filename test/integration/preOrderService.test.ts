import server from '../../src/server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { CertificatedPhoneToken, LoginToken } from '../../src/utils/jwt';
import userService from '../../src/services/userService';
import storeService from '../../src/services/storeService';
import menuService from '../../src/services/menuService';
import * as Menu from '../../src/DTO/menu.dto';
import * as PreOrder from '../../src/DTO/preOrder.dto';
import * as Order from '../../src/DTO/order.dto';
import { Prisma } from '@prisma/client';
import test400 from './400test';

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
    ['/api/preorder', 'POST'],
    ['/api/preorder', 'GET'],
    ['/api/preorder/1', 'GET'],
  ]);
});

let preOrderId: number;
test('preOrder', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/preorder`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: storeId.toString(),
    },
    payload: {
      reservationDateTime: '2023-09-18T10:01:12.301Z',
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
  ) as PreOrder.newPreOrderInterface['Reply']['200'];
  preOrderId = body.preOrderId;
  expect(body.preOrderId).toBeDefined();
});
let preOrderData: any;
test('get preOrder', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/preorder/${preOrderId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: storeId.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as PreOrder.getPreOrderInterface['Reply']['200'];
  preOrderData = body;
  expect(body.totalPrice).toEqual(
    Prisma.Decimal.sum(
      Prisma.Decimal.mul(menus[0].price, 2),
      menus[1].price
    ).toString()
  );
});

test('get preorder list', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/preorder?page=1&count=10&date=2023-09-18T10:01:12.301Z`,

    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: storeId.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as PreOrder.getPreOrderListInterface['Reply']['200'];
  if (body.preOrders.length === 0) return;
  expect(body.preOrders.length).toBeGreaterThan(0);
  const order = body.preOrders[0];
  expect(order.preOrderId).toEqual(preOrderId);
  expect(order.totalCount).toEqual(3);
});

test('preOrder to order', async () => {
  preOrderData.preOrderitems.forEach((item: any) => {
    let optionList: any[] = [];
    item.options.forEach((option: any) => {
      optionList.push(option.id);
    });
    item.options = optionList;
  }); //각 options의 id만 배열로 바꿔줌
  const response = await app.inject({
    method: 'POST',
    url: `/api/order`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: storeId.toString(),
    },
    payload: {
      preOrderId: preOrderId,
      totalPrice: preOrderData.totalPrice,
      menus: preOrderData.preOrderitems,
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Order.newOrderInterface['Reply']['200'];
  expect(body.orderId).toBeDefined();
});
