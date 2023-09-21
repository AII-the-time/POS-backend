import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import ErrorConfig from '@errors/config';
import { ErrorWithToast } from '@errors';
export const AuthorizationHeader = {
  type: 'object',
  properties: {
    authorization: { type: 'string' },
  },
  required: ['authorization'],
} as const;

export const StoreAuthorizationHeader = {
  type: 'object',
  properties: {
    authorization: { type: 'string' },
    storeid: { type: 'string' },
  },
  required: ['authorization', 'storeid'],
} as const;

export const errorSchema = (...errors: Array<new (message:string,...any:any) => ErrorWithToast>) => {
  const errorConfigs = ErrorConfig.filter((errorConfig) => errors.some((error) => errorConfig.error === error));
  return errorConfigs.reduce((acc, cur) => {
    const errorInstance = new cur.error("");
    if(acc[cur.code]) {
      acc[cur.code].properties.error.enum.push(errorInstance.name);
      acc[cur.code].description += `\n${cur.describtion}`;
      acc[cur.code].properties.toast.enum.push(cur.toast(errorInstance));
      return acc;
    }
    acc[cur.code] = {
      type: 'object',
      description: cur.describtion,
      required: ['error','message','toast'],
      properties: {
        error: { type: 'string', enum: [errorInstance.name] },
        message: { type: 'string'},
        toast: { type: 'string', enum: [cur.toast(errorInstance)] }
      }
    }
    return acc;
  },{} as {
    [key:number]: {
      type: 'object',
      description: string,
      required: ['error','message','toast'],
      properties: {
        error: { type: 'string', enum: string[] },
        message: { type: 'string'},
        toast: { type: 'string', enum: string[] }
      }
    }
  });
};

export type ErrorInterface = FromSchema<{
  type: 'object',
  description: string,
  required: ['error','message','toast'],
  properties: {
    error: { type: 'string', enum: string[] },
    message: { type: 'string'},
    toast: { type: 'string', enum: string[] }
  }
}>;

export type SchemaToInterfase<
  T extends {
    body?: JSONSchema;
    querystring?: JSONSchema;
    params?: JSONSchema;
    headers?: JSONSchema;
    response: { [key: string]: JSONSchema };
  },
  Option extends [{ pattern: unknown; output: unknown }] | false = false
> = {
  Body: T['body'] extends JSONSchema ? FromSchema<T['body']> : undefined;
  Querystring: T['querystring'] extends JSONSchema
    ? FromSchema<T['querystring']>
    : undefined;
  Params: T['params'] extends JSONSchema ? FromSchema<T['params']> : undefined;
  Headers: T['headers'] extends JSONSchema
    ? FromSchema<T['headers']>
    : undefined;
  Reply: {
    [key in keyof T['response']]: FromSchema<
      T['response'][key],
      { deserialize: Option }
    >;
  };
};
