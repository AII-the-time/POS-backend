import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { LoginToken } from '@utils/jwt';
import seedValues from './seedValues';
import * as Menu from '@DTO/menu.dto';
import { ErrorInterface } from "@DTO/index.dto";

let app: FastifyInstance;

const accessToken = new LoginToken(seedValues.user.id).signAccessToken();
beforeAll(async () => {
  app = await server();
});

afterAll(async () => {
  await app.close();
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

  const body = JSON.parse(response.body) as Menu.getMenuListInterface['Reply']['200'];
  expect(body).toEqual({
    categories: [
      {
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
      },
      {
        category: '티&에이드',
        categoryId: 2,
        menus: [
          {
            id: 3,
            name: '아이스티',
            price: '2500',
          },
        ],
      },
    ],
  });
});

test('get menu detail', async () => {
  const response = await app.inject({
    method: 'GET',
    url: `/api/menu/1`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: seedValues.store.id.toString(),
    },
  });
  expect(response.statusCode).toBe(200);

  const body = JSON.parse(response.body) as Menu.getMenuInterface['Reply']['200'];
  expect(body).toEqual({
    name: '아메리카노',
    price: '2000',
    categoryId: 1,
    category: '커피',
    option: [
      {
        optionType: '온도',
        options: [
          {
            id: 1,
            name: 'ice',
            price: '0',
            isSelectable: true
          },
          {
            id: 2,
            name: 'hot',
            price: '0',
            isSelectable: true
          }
        ]
      },
      {
        optionType: '원두',
        options: [
          {
            id: 3,
            name: '케냐',
            price: '0',
            isSelectable: true
          },
          {
            id: 4,
            name: '콜롬비아',
            price: '300',
            isSelectable: true
          }
        ]
      },
      {
        optionType: '샷',
        options: [
          {
            id: 5,
            name: '1샷 추가',
            price: '500',
            isSelectable: true
          },
          {
            id: 6,
            name: '연하게',
            price: '0',
            isSelectable: true
          }
        ]
      }
    ],
    recipe: expect.any(Array)
  });
});
