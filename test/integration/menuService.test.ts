import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { LoginToken } from '@utils/jwt';
import seedValues from './seedValues';
import * as Menu from '@DTO/menu.dto';
import * as Stock from '@DTO/stock.dto';
import * as Order from '@DTO/order.dto';
import { ErrorInterface } from '@DTO/index.dto';

let app: FastifyInstance;

const accessToken = new LoginToken(seedValues.user.id).signAccessToken();
beforeAll(async () => {
  app = await server();
});

afterAll(async () => {
  await app.close();
});
let categoryId: number;
test('new menu category', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/menu/category`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '디저트',
      sort: 4,
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Menu.createCategoryInterface['Reply']['201'];
  categoryId = body.categoryId;
  expect(body).toEqual({
    categoryId: 4,
  });
});

test('soft delete category', async () => {
  const response = await app.inject({
    method: 'PUT',
    url: `/api/menu/category/${categoryId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(204);
  const body = JSON.parse(
    response.body
  ) as Menu.softDeleteCategoryInterface['Reply']['204'];
  expect(body).toEqual({
    categoryId: 4,
  });
});

let mintChoco: number;
test('create stock with name only', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/stock`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '민트초코 시럽',
    },
  });

  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Stock.createStockInterface['Reply']['201'];
  mintChoco = body.stockId;
});

let cock: number;
test('create stock with name and price', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/stock`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '콜라',
      amount: 8520,
      unit: 'ml',
      price: 23900,
    },
  });

  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Stock.createStockInterface['Reply']['201'];
  cock = body.stockId;
});

test('create stock and soft delete', async () => {
  const createResponse = await app.inject({
    method: 'POST',
    url: `/api/stock`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '콜라',
      amount: 8520,
      unit: 'ml',
      price: 23900,
    },
  });

  expect(createResponse.statusCode).toBe(201);
  const body = JSON.parse(
    createResponse.body
  ) as Stock.createStockInterface['Reply']['201'];

  const softDeleteResponse = await app.inject({
    method: 'PUT',
    url: `/api/stock/${body.stockId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });

  expect(softDeleteResponse.statusCode).toBe(204);
  const body2 = JSON.parse(
    softDeleteResponse.body
  ) as Stock.softDeleteStockInterface['Reply']['204'];
  expect(body2).toEqual({
    stockId: body.stockId,
  });
});

test('new menu', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/menu`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '민초콕',
      price: 3000,
      categoryId: 2,
      option: [1, 3, 4],
      recipe: [
        {
          id: mintChoco,
          isMixed: false,
          unit: 'ml',
          coldRegularAmount: 50,
        },
        {
          id: cock,
          isMixed: false,
          unit: 'ml',
          coldRegularAmount: 150,
        },
      ],
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Menu.createMenuInterface['Reply']['201'];
  expect(body).toEqual({
    menuId: 45,
  });
});

test('new menu and soft delete', async () => {
  const createResponse = await app.inject({
    method: 'POST',
    url: `/api/menu`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '민초콕',
      price: 3000,
      categoryId: 2,
      option: [1, 3, 4],
      recipe: [
        {
          id: mintChoco,
          isMixed: false,
          unit: 'ml',
          coldRegularAmount: 50,
        },
        {
          id: cock,
          isMixed: false,
          unit: 'ml',
          coldRegularAmount: 150,
        },
      ],
    },
  });
  expect(createResponse.statusCode).toBe(201);
  const body = JSON.parse(
    createResponse.body
  ) as Menu.createMenuInterface['Reply']['201'];
  const softDeleteResponse = await app.inject({
    method: 'PUT',
    url: `/api/menu/${body.menuId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(softDeleteResponse.statusCode).toBe(204);
  const body2 = JSON.parse(
    createResponse.body
  ) as Menu.softDeleteMenuInterface['Reply']['204'];
  expect(body2).toEqual({
    menuId: body.menuId,
  });
});

let sugar: number;
test('search stock', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/search?name=설탕`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.searchStockInterface['Reply']['200'];
  sugar = body.stocks[0].id;
});

let chocoSyrup: number;
test('search stock', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/search?name=초코시럽`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.searchStockInterface['Reply']['200'];
  chocoSyrup = body.stocks[0].id;
});

let mintChocoChung: number;
test('new mixedStock', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/stock/mixed`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '민트초코 청',
      mixing: [
        {
          id: mintChoco,
          unit: 'ml',
          amount: 1000,
        },
        {
          id: sugar,
          unit: 'g',
          amount: 1000,
        },
      ],
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Stock.createMixedStockInterface['Reply']['201'];
  mintChocoChung = body.mixedStockId;
});

test('new mixedStock and delete', async () => {
  const createResponse = await app.inject({
    method: 'POST',
    url: `/api/stock/mixed`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '민트초코 청',
      mixing: [
        {
          id: mintChoco,
          unit: 'ml',
          amount: 1000,
        },
        {
          id: sugar,
          unit: 'g',
          amount: 1000,
        },
      ],
    },
  });
  expect(createResponse.statusCode).toBe(201);
  const body = JSON.parse(
    createResponse.body
  ) as Stock.createMixedStockInterface['Reply']['201'];
  const softDeleteResponse = await app.inject({
    method: 'PUT',
    url: `/api/stock/mixed/${body.mixedStockId}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(softDeleteResponse.statusCode).toBe(204);
  const body2 = JSON.parse(
    softDeleteResponse.body
  ) as Stock.softDeleteMixedStockInterface['Reply']['204'];
  expect(body2).toEqual({
    mixedStockId: body.mixedStockId,
  });
});

test('get stock detail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/${mintChoco}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.getStockInterface['Reply']['200'];
  expect(body).toEqual({
    name: '민트초코 시럽',
    price: '0',
    amount: null,
    currentAmount: null,
    noticeThreshold: 0,
    unit: 'ml',
    updatedAt: expect.any(String),
  });
});

test('update stock', async () => {
  const response = await app.inject({
    method: 'PUT',
    url: `/api/stock`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      id: mintChoco,
      name: '민트초코 시럽',
      price: 3000,
      amount: 1000,
      unit: 'ml',
      currentAmount: 1000,
      noticeThreshold: 500,
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Stock.updateStockInterface['Reply']['201'];
  expect(body).toEqual({
    stockId: mintChoco,
  });
});

test('get stock detail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/${mintChoco}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.getStockInterface['Reply']['200'];
  expect(body).toEqual({
    name: '민트초코 시럽',
    price: '3000',
    amount: 1000,
    currentAmount: 1000,
    noticeThreshold: 500,
    unit: 'ml',
    updatedAt: expect.any(String),
  });
});

test('get stock detail fail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/456784353456`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(404);
});

test('get mixed stock list', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/mixed`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.getMixedStockListInterface['Reply']['200'];
  const mintChocoChung = body.mixedStocks.find(
    (stock) => stock.name === '민트초코 청'
  );
  expect(mintChocoChung).toEqual({
    id: expect.any(Number),
    name: '민트초코 청',
  });
});

test('update mixed stock', async () => {
  const response = await app.inject({
    method: 'PUT',
    url: `/api/stock/mixed`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      id: mintChocoChung,
      name: '민트초코 청',
      totalAmount: 2200,
      unit: 'g',
      mixing: [
        {
          id: mintChoco,
          unit: 'ml',
          amount: 1000,
        },
        {
          id: sugar,
          unit: 'g',
          amount: 1000,
        },
        {
          id: chocoSyrup,
          unit: 'ml',
          amount: 200,
        },
      ],
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Stock.updateMixedStockInterface['Reply']['201'];
  expect(body).toEqual({
    mixedStockId: mintChocoChung,
  });
});

test('get mixed stock detail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/mixed/${mintChocoChung}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.getMixedStockInterface['Reply']['200'];
  expect(body).toEqual({
    name: '민트초코 청',
    totalAmount: 2200,
    unit: 'g',
    mixing: [
      {
        id: mintChoco,
        name: '민트초코 시럽',
        amount: 1000,
        unit: 'ml',
      },
      {
        id: sugar,
        name: '설탕',
        amount: 1000,
        unit: 'g',
      },
      {
        id: chocoSyrup,
        name: '초코시럽',
        amount: 200,
        unit: 'ml',
      },
    ],
  });
});

test('get mixed stock detail fail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/mixed/456784353456`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(404);
});

let sparklingWater: number;
test('search stock', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/withMixed/search?name=탄산수`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.searchStockAndMixedStockInterface['Reply']['200'];
  sparklingWater = body.stocks[0].id;
});

test('search stock and mixed stock', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/withMixed/search?name=민트초코`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.searchStockAndMixedStockInterface['Reply']['200'];
  expect(body.stocks.length).toBeGreaterThanOrEqual(2);
});

test('new menu without option', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/menu`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '민트초코 에이드',
      price: 3000,
      categoryId: 2,
      recipe: [
        {
          id: sparklingWater,
          isMixed: false,
          unit: 'ml',
          coldRegularAmount: 150,
        },
        {
          id: mintChocoChung,
          isMixed: true,
          unit: 'ml',
          coldRegularAmount: 50,
        },
      ],
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Menu.createMenuInterface['Reply']['201'];
  expect(body).toEqual({
    menuId: 47,
  });
});

test('get stock list', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.getStockListInterface['Reply']['200'];
  const mintChoco = body.stocks.find((stock) => stock.name === '민트초코 시럽');
  expect(mintChoco).toEqual({
    id: expect.any(Number),
    name: '민트초코 시럽',
    status: 'ENOUGH',
    usingMenuCount: 2,
  });
  const cock = body.stocks.find((stock) => stock.name === '콜라');
  expect(cock).toEqual({
    id: expect.any(Number),
    name: '콜라',
    status: 'UNKNOWN',
    usingMenuCount: 1,
  });
});

test('get menu list', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/menu`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);

  const body = JSON.parse(
    response.body
  ) as Menu.getMenuListInterface['Reply']['200'];
  expect(body.categories[0]).toEqual({
    category: '커피',
    categoryId: 1,
    menus: [
      {
        id: 1,
        name: '아메리카노',
        price: '2000',
      },
      {
        id: 2,
        name: '카페라떼',
        price: '3000',
      },
    ],
  });
  expect(body.categories[1]).toEqual({
    category: '티&에이드',
    categoryId: 2,
    menus: [
      {
        id: 3,
        name: '아이스티',
        price: '2500',
      },
      {
        id: 45,
        name: '민초콕',
        price: '3000',
      },
      {
        id: 47,
        name: '민트초코 에이드',
        price: '3000',
      },
    ],
  });
});

test('get menu detail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/menu/45`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);

  const body = JSON.parse(
    response.body
  ) as Menu.getMenuInterface['Reply']['200'];
  expect(body).toEqual({
    name: '민초콕',
    price: '3000',
    categoryId: 2,
    category: '티&에이드',
    option: [
      {
        optionType: '온도',
        options: [
          {
            id: 1,
            name: 'ice',
            price: '0',
            isSelectable: true,
          },
          {
            id: 2,
            name: 'hot',
            price: '0',
            isSelectable: false,
          },
        ],
      },
      {
        optionType: '원두',
        options: [
          {
            id: 3,
            name: '케냐',
            price: '0',
            isSelectable: true,
          },
          {
            id: 4,
            name: '콜롬비아',
            price: '300',
            isSelectable: true,
          },
        ],
      },
      {
        optionType: '샷',
        options: [
          {
            id: 5,
            name: '1샷 추가',
            price: '500',
            isSelectable: false,
          },
          {
            id: 6,
            name: '연하게',
            price: '0',
            isSelectable: false,
          },
        ],
      },
    ],
    recipe: [
      {
        id: mintChoco,
        name: '민트초코 시럽',
        coldRegularAmount: 50,
        coldSizeUpAmount: null,
        hotRegularAmount: null,
        hotSizeUpAmount: null,
        isMixed: false,
        unit: 'ml',
      },
      {
        id: cock,
        name: '콜라',
        coldRegularAmount: 150,
        coldSizeUpAmount: null,
        hotRegularAmount: null,
        hotSizeUpAmount: null,
        isMixed: false,
        unit: 'ml',
      },
    ],
  });
});
test('get not exist menu detail', async () => {
  // service 폴더 내 menuService.test.ts 에서 에러 체크
  // getMenu에서 menu가 존재하지 않는 경우 에러를 던지도록 설정
  const response = await app.inject({
    method: 'GET',
    url: `/api/menu/100`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(404);
  const body = JSON.parse(response.body) as ErrorInterface;
  expect(body.message).toBe('메뉴가 존재하지 않습니다.');
});

test('update menu', async () => {
  const response = await app.inject({
    method: 'PUT',
    url: `/api/menu`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      id: 3,
      name: '아이스티',
      price: 2500,
      categoryId: 2,
      option: [1, 3, 5, 6],
      recipe: [
        {
          id: sparklingWater,
          isMixed: false,
          unit: 'ml',
          coldRegularAmount: 150,
        },
      ],
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Menu.updateMenuInterface['Reply']['201'];
  expect(body).toEqual({
    menuId: 48,
  });
});

test('create menu without option and recipe', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/menu`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '오렌지에이드',
      price: 2500,
      categoryId: 2,
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Menu.updateMenuInterface['Reply']['201'];
  expect(body).toEqual({
    menuId: 49,
  });
});

test('update menu without option and recipe', async () => {
  const response = await app.inject({
    method: 'PUT',
    url: `/api/menu`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      id: 49,
      name: '오렌지에이드',
      price: 2500,
      categoryId: 2,
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Menu.updateMenuInterface['Reply']['201'];
  expect(body).toEqual({
    menuId: 50,
  });
});

test('get menu detail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/menu/48`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);

  const body = JSON.parse(
    response.body
  ) as Menu.getMenuInterface['Reply']['200'];
  expect(body).toEqual({
    name: '아이스티',
    price: '2500',
    categoryId: 2,
    category: '티&에이드',
    option: [
      {
        optionType: '온도',
        options: [
          {
            id: 1,
            name: 'ice',
            price: '0',
            isSelectable: true,
          },
          {
            id: 2,
            name: 'hot',
            price: '0',
            isSelectable: false,
          },
        ],
      },
      {
        optionType: '원두',
        options: [
          {
            id: 3,
            name: '케냐',
            price: '0',
            isSelectable: true,
          },
          {
            id: 4,
            name: '콜롬비아',
            price: '300',
            isSelectable: false,
          },
        ],
      },
      {
        optionType: '샷',
        options: [
          {
            id: 5,
            name: '1샷 추가',
            price: '500',
            isSelectable: true,
          },
          {
            id: 6,
            name: '연하게',
            price: '0',
            isSelectable: true,
          },
        ],
      },
    ],
    recipe: expect.any(Array),
  });
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
      totalPrice: '3000',
      menus: [
        {
          id: 45,
          count: 1,
          options: [],
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
    },
  });

  expect(response.statusCode).toBe(200);
});

test('get stock detail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/${mintChoco}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.getStockInterface['Reply']['200'];
  expect(body).toEqual({
    name: '민트초코 시럽',
    price: '3000',
    amount: 1000,
    currentAmount: 950,
    noticeThreshold: 500,
    unit: 'ml',
    updatedAt: expect.any(String),
  });
});

let mixedOrderId: number;
test('order', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/order`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    payload: {
      totalPrice: '3000',
      menus: [
        {
          id: 47,
          count: 2,
          options: [],
        },
      ],
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Order.newOrderInterface['Reply']['200'];
  mixedOrderId = body.orderId;
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
      orderId: mixedOrderId,
      paymentMethod: 'CARD',
    },
  });

  expect(response.statusCode).toBe(200);
});

test('get stock detail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/stock/${mintChoco}`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(
    response.body
  ) as Stock.getStockInterface['Reply']['200'];
  expect(body).toEqual({
    name: '민트초코 시럽',
    price: '3000',
    amount: 1000,
    currentAmount: 904,
    noticeThreshold: 500,
    unit: 'ml',
    updatedAt: expect.any(String),
  });
});
