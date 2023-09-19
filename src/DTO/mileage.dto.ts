import { Mileage as prismaMileage } from '@prisma/client';
import {
  StoreAuthorizationHeader,
  errorSchema,
  SchemaToInterfase,
} from '@DTO/index.dto';
export type Mileage = prismaMileage;

export const getMileageSchema = {
  tags: ['mileage'],
  summary: '마일리지 조회',
  headers: StoreAuthorizationHeader,
  querystring: {
    type: 'object',
    required: ['phone'],
    properties: {
      phone: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['mileageId', 'mileage'],
      properties: {
        mileageId: { type: 'number' },
        mileage: { type: 'string' },
      },
    },
    401: errorSchema('토큰이 만료되었습니다.'),
    404: errorSchema('마일리지가 존재하지 않습니다.'),
  },
} as const;

export const registerMileageSchema = {
  tags: ['mileage'],
  summary: '마일리지 등록',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['phone'],
    properties: {
      phone: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['mileageId'],
      properties: {
        mileageId: { type: 'number' },
      },
    },
    401: errorSchema('토큰이 만료되었습니다.'),
  },
} as const;

export const saveMileageSchema = {
  tags: ['mileage'],
  summary: '마일리지 적립',
  headers: StoreAuthorizationHeader,
  body: {
    type: 'object',
    required: ['mileageId', 'mileage'],
    properties: {
      mileageId: { type: 'number' },
      mileage: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      description: 'success response',
      required: ['mileage'],
      properties: {
        mileage: { type: 'string' },
      },
    },
    401: errorSchema('토큰이 만료되었습니다.'),
  },
} as const;

export type getMileageInterface = SchemaToInterfase<typeof getMileageSchema>;
export type registerMileageInterface = SchemaToInterfase<
  typeof registerMileageSchema
>;
export type saveMileageInterface = SchemaToInterfase<typeof saveMileageSchema>;
