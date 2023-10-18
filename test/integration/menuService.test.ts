import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { LoginToken } from '@utils/jwt';
import seedValues from './seedValues';
import * as Menu from '@DTO/menu.dto';
import { ErrorInterface } from '@DTO/index.dto';

let app: FastifyInstance;

const accessToken = new LoginToken(seedValues.user.id).signAccessToken();
beforeAll(async () => {
  app = await server();
});

afterAll(async () => {
  await app.close();
});

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
  expect(body).toEqual({
    categoryId: 4,
  });
});

let mintChoco: number;
test('create stock with name only', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/menu/stock`,
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
  ) as Menu.createStockInterface['Reply']['201'];
  mintChoco = body.stockId;
});

let cock: number;
test('create stock with name and price', async () => {
  const response = await app.inject({
    method: 'POST',
    url: `/api/menu/stock`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      name: '콜라',
      amount: 8520,
      unit: 'ml',
      price: 23900
    },
  });
  
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Menu.createStockInterface['Reply']['201'];
  cock = body.stockId;
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
          id:cock,
          isMixed: false,
          unit: 'ml',
          coldRegularAmount: 150,
        }
      ]
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

let sparklingWater:number;
test('search stock',async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/menu/stock?name=탄산수`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body) as Menu.searchStockInterface['Reply']['200'];
  sparklingWater = body.stocks[0].id;
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
          id:mintChoco,
          isMixed: false,
          unit: 'ml',
          coldRegularAmount: 50,
        }
      ]
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Menu.createMenuInterface['Reply']['201'];
  expect(body).toEqual({
    menuId: 46,
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
        id: 46,
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
        unit: 'ml'
      },
      {
        id: cock,
        name: '콜라',
        coldRegularAmount: 150,
        coldSizeUpAmount: null,
        hotRegularAmount: null,
        hotSizeUpAmount: null,
        isMixed: false,
        unit: 'ml'
      }
    ]
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
      recipe: [],
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Menu.updateMenuInterface['Reply']['201'];
  expect(body).toEqual({
    menuId: 3,
  });
});

test('update menu without option', async () => {
  const response = await app.inject({
    method: 'PUT',
    url: `/api/menu`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
    body: {
      id: 46,
      name: '오렌지에이드',
      price: 2500,
      categoryId: 2,
      recipe: [],
    },
  });
  expect(response.statusCode).toBe(201);
  const body = JSON.parse(
    response.body
  ) as Menu.updateMenuInterface['Reply']['201'];
  expect(body).toEqual({
    menuId: 46,
  });
});

test('get menu detail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/menu/3`,
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
