import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { CertificatedPhoneToken } from '@utils/jwt';
import userService from '@services/userService';
import * as Store from '@DTO/store.dto';
import * as Menu from '@DTO/menu.dto';
import test400 from './400test';

let app: FastifyInstance;

const phone = '01011112222';
const businessRegistrationNumber = '1122233444';
let accessToken: string;

beforeAll(async () => {
  app = await server();
  const certificatedPhoneToken = new CertificatedPhoneToken(phone).sign();
  accessToken = (
    await userService.login({
      businessRegistrationNumber,
      certificatedPhoneToken,
    })
  ).accessToken;
});

afterAll(async () => {
  await app.close();
});

const storeName = '테스트 매장';
const storeAddress = '서울시 강남구';
const defaultOpeningHours: Array<{
  day: string;
  open: string | null;
  close: string | null;
}> = [
  {
    day: '일',
    open: null,
    close: null,
  },
  ...['월', '화', '수', '목', '금', '토'].map((day) => ({
    day: day,
    open: '09:00',
    close: '18:00',
  })),
  {
    day: '공휴일',
    open: '10:00',
    close: '17:00',
  },
];

test('400 test', async () => {
  await test400(app, [
    ['/api/store', 'POST'],
    ['/api/store', 'GET'],
  ]);
});

let storeId: number;
test('new store', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/store',
    payload: {
      name: storeName,
      address: storeAddress,
      openingHours: defaultOpeningHours,
    },
    headers: {
      authorization: accessToken,
    },
  });
  expect(response.statusCode).toBe(200);

  const body = JSON.parse(
    response.body
  ) as Store.newStoreInterface['Reply']['200'];
  expect(body).toHaveProperty('storeId');
  storeId = body.storeId;
});

test('default options',async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/menu/option',
    headers: {
      authorization: accessToken,
      storeid: storeId.toString(),
    },
  });
  expect(response.statusCode).toBe(200);

  const body = JSON.parse(
    response.body
  ) as Menu.getOptionListInterface['Reply']['200'];
  expect(body).toHaveProperty('option');
  console.log(body.option);
  expect(body.option).toEqual([
    {
      optionType: '온도',
      options: [
        {
          id: expect.any(Number),
          name: 'ice',
          price: '0',
        },
        {
          id: expect.any(Number),
          name: 'hot',
          price: '0',
        },
      ],
    },
    {
      optionType: '원두',
      options: [
        {
          id: expect.any(Number),
          name: '케냐',
          price: '0',
        },
        {
          id: expect.any(Number),
          name: '콜롬비아',
          price: '300',
        },
      ],
    },
    {
      optionType: '샷',
      options: [
        {
          id: expect.any(Number),
          name: '1샷 추가',
          price: '500',
        },
        {
          id: expect.any(Number),
          name: '연하게',
          price: '0',
        },
      ],
    },
  ]);
})

test('get store list', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/store',
    headers: {
      authorization: accessToken,
    },
  });
  expect(response.statusCode).toBe(200);

  const body = JSON.parse(
    response.body
  ) as Store.storeListInterface['Reply']['200'];
  expect(body).toHaveProperty('stores');
  expect(body.stores.length).toBeGreaterThan(0);
  const lastStore = body.stores[body.stores.length - 1];
  expect(lastStore).toHaveProperty('storeId');
  expect(lastStore).toHaveProperty('name');
  expect(lastStore).toHaveProperty('address');
  expect(lastStore).toEqual({
    storeId: storeId,
    name: storeName,
    address: storeAddress,
  });
});
