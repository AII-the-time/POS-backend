import { FromSchema, JSONSchema } from "json-schema-to-ts";

export const AuthorizationHeader = {
    type: 'object',
    properties: {
        authorization: { type: 'string' }
    },
    required: ['authorization']
} as const;

export const StoreAuthorizationHeader = {
    type: 'object',
    properties: {
        authorization: { type: 'string' },
        storeid: { type: 'string' }
    },
    required: ['authorization','storeid']
} as const;

export const errorSchema = (describtion:string) => ({
    type: 'object',
    description: describtion,
    properties: {
        error: { type: 'string' },
        message: { type: 'string' },
        toast: { type: 'string' }
    }
}) as const;

export type SchemaToInterfase<
T extends {body?:JSONSchema, querystring?:JSONSchema, params?:JSONSchema, headers?:JSONSchema,response: {[key:string]:JSONSchema}},
Option extends [{pattern:unknown,output:unknown}] | false = false
>={
    Body: T['body'] extends JSONSchema ? FromSchema<T['body']> : undefined;
    Querystring: T['querystring'] extends JSONSchema ? FromSchema<T['querystring']> : undefined;
    Params: T['params'] extends JSONSchema ? FromSchema<T['params']> : undefined;
    Headers: T['headers'] extends JSONSchema ? FromSchema<T['headers']> : undefined;
    Reply: {
        [key in keyof T['response']]: FromSchema<
            T['response'][key],
            { deserialize: Option }
        >;
    }
}
