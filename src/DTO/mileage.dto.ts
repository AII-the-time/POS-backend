import { Mileage as prismaMileage } from '@prisma/client';
import {
  StoreAuthorizationHeader,
  errorSchema,
  SchemaToInterfase,
} from '@DTO/index.dto';
import * as E from '@errors';
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
    ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
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
    ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
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
    ...errorSchema(E.NotFoundError, E.UserAuthorizationError, E.StoreAuthorizationError, E.NoAuthorizationInHeaderError)
  },
} as const;

export type getMileageInterface = SchemaToInterfase<typeof getMileageSchema>;
export type registerMileageInterface = SchemaToInterfase<
  typeof registerMileageSchema
>;
export type saveMileageInterface = SchemaToInterfase<typeof saveMileageSchema>;
