import server from '@server';
import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { ErrorInterface } from '@DTO/index.dto';
import { LoginToken } from '@utils/jwt';
import seedValues from './seedValues';

let app: FastifyInstance;

beforeAll(async () => {
  app = await server();
});

afterAll(async () => {
  await app.close();
});

test('ping', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/ping',
  });
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body) as { data: string };
  expect(body.data).toBe('pong');
});

test('human error', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/notDefinedOnConfigerror',
  });
  expect(response.statusCode).toBe(500);
  const body = JSON.parse(response.body) as ErrorInterface;
  expect(body.message).toBe('notDefinedOnConfigerror');
});

test('notDefinederror', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/notDefinederror',
  });
  expect(response.statusCode).toBe(500);
});

const accessToken = new LoginToken(seedValues.user.id).signAccessToken();
const customerPhone = '01043218765';

test('register mileage without storeid header', async () => {
  // api 폴더 hooks 폴더 checkStoreIdUser.ts 에서 에러 체크
  // storeid가 없는 경우 에러를 던지도록 설정
  const response = await app.inject({
    method: 'POST',
    url: `/api/mileage`,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    payload: {
      phone: customerPhone,
    },
  });
  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body) as ErrorInterface;
  expect(body.message).toBe('헤더에 storeid가 없습니다');
});

test('register mileage without storeid header', async () => {
  // api 폴더 hooks 폴더 checkStoreIdUser.ts 에서 에러 체크
  // 잘못된 토큰 확인
  const response = await app.inject({
    method: 'POST',
    url: `/api/mileage`,
    headers: {
      authorization: `Bearer ${accessToken}1`,
      storeid: seedValues.store.id.toString(),
    },
    payload: {
      phone: customerPhone,
    },
  });
  expect(response.statusCode).toBe(401);
  const body = JSON.parse(response.body) as ErrorInterface;
  expect(body.message).toBe('유저 인증에 실패했습니다');
});

test('register mileage without storeid header', async () => {
  // api 폴더 hooks 폴더 checkStoreIdUser.ts 에서 에러 체크
  // 잘못된 스토어 아이디 확인
  const response = await app.inject({
    method: 'POST',
    url: `/api/mileage`,
    headers: {
      authorization: `Bearer ${accessToken}`,
      storeid: '123242214',
    },
    payload: {
      phone: customerPhone,
    },
  });
  expect(response.statusCode).toBe(401);
  const body = JSON.parse(response.body) as ErrorInterface;
  expect(body.message).toBe('가게 인증에 실패했습니다');
});
