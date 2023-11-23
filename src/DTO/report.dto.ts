import {
  StoreAuthorizationHeader,
  errorSchema,
} from '@DTO/index.dto';
import * as E from '@errors';
import { SchemaToInterface } from 'fastify-schema-to-ts';
import { FromSchema } from 'json-schema-to-ts';

export const calendarSchema = {
  type: 'object',
  required: ['calendarTitle', 'calendarDate', 'calendarItems'],
  properties: {
    calendarTitle: { type: 'string' },
    calendarDate: { type: 'string', format: 'date-time' },
    calendarItems: {
      type: 'array',
      items: {
        type: 'object',
        required: ['contentDate', 'Value'],
        properties: {
          contentDate: { type: 'string', format: 'date-time' },
          Value: { type: 'number' },
        },
      },
    },
  },
} as const;

export const pieChartSchema = {
  type: 'object',
  required: ['pieChartTitle', 'totalCount', 'pieChartItems'],
  properties: {
    pieChartTitle: { type: 'string' },
    totalCount: { type: 'number' },
    pieChartItems: {
      type: 'array',
      items: {
        type: 'object',
        required: ['categoryName', 'categoryCount', 'charColor'],
        properties: {
          categoryName: { type: 'string' },
          categoryCount: { type: 'number' },
          charColor: { type: 'string' },
        },
      },
    },
  },
} as const;

export const graphSchema = {
  type: 'object',
  required: ['graphTitle', 'graphItems', 'graphColor'],
  properties: {
    graphTitle: { type: 'string' },
    graphColor: { type: 'string' },
    graphItems: {
      type: 'array',
      items: {
        type: 'object',
        required: ['graphKey', 'graphValue'],
        properties: {
          graphKey: { type: 'string' },
          graphValue: { type: 'number' },
        },
      },
    },
  },
} as const;

export const textSchema = {
  type: 'object',
  required: ['align', 'textItems'],
  properties: {
    align: { enum: ['LEFT', 'CENTER', 'RIGHT'] },
    textItems: {
      type: 'array',
      items: {
        type: 'object',
        required: ['text', 'color', 'size'],
        properties: {
          text: { type: 'string' },
          color: { type: 'string' },
          size: { type: 'number' },
        },
      },
    },
  },
} as const;

export const reportSchema = {
  tags: ['report'],
  summary: '리포트 생성',
  headers: StoreAuthorizationHeader,
  response: {
    200: {
      type: 'object',
      required: ['responseData'],
      properties: {
        responseData: {
          type: 'object',
          required: ['screenName', 'viewContents'],
          properties: {
            screenName: { type: 'string' },
            viewContents: { 
              type: 'array',
              items: {
                anyOf: [
                  {
                      type: 'object',
                      required: ['viewType', 'content'],
                      properties: {
                        viewType: { const: 'CALENDAR' },
                        content: calendarSchema,
                      },
                  },
                  {
                    type: 'object',
                    required: ['viewType', 'content'],
                    properties: {
                      viewType: { const: 'PIECHART' },
                      content: pieChartSchema,
                    },
                  },
                  {
                    type: 'object',
                    required: ['viewType', 'content'],
                    properties: {
                      viewType: { const: 'GRAPH' },
                      content: graphSchema,
                    },
                  },
                  {
                    type: 'object',
                    required: ['viewType', 'content'],
                    properties: {
                      viewType: { const: 'TEXT' },
                      content: textSchema,
                    },
                  },
                ],
              },
            },
          },
        }
      },
    },
    ...errorSchema(
      E.NotFoundError,
      E.UserAuthorizationError,
      E.StoreAuthorizationError,
      E.NoAuthorizationInHeaderError
    ),
  },
} as const;

export type reportInterface = SchemaToInterface<
  typeof reportSchema,
  [{ pattern: { type: 'string'; format: 'date-time' }; output: Date }]
> & { Body: { storeId: number; userId: number } };
export type calenderInterface = FromSchema<typeof calendarSchema, { deserialize: [{ pattern: { type: 'string'; format: 'date-time' }; output: Date }] }>;
export type pieChartInterface = FromSchema<typeof pieChartSchema>;
export type graphInterface = FromSchema<typeof graphSchema>;
export type textInterface = FromSchema<typeof textSchema>;
