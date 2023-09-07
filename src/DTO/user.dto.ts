import { FastifySchema } from 'fastify';
import { User as prismaUser } from '@prisma/client';
import { FromSchema } from "json-schema-to-ts";
export type User = prismaUser;

export const phoneSchema ={
    tags: ['user'],
    summary: '사용자 휴대폰으로 인증번호 발송',
    body: {
        type: 'object',
        required: ['phone'],
        properties: {
            phone: {
                type: 'string',
            }
        }
    },
    response: {
        200: {
            type: 'object',
            description: 'success response',
            properties: {
                tokenForCertificatePhone: { type: 'string' }
            }
        },
        400: {
            type: 'object',
            description: 'Bad Request',
            properties: {
                error: { type: 'string' },
                message: { type: 'string' }
            }
        }
    }
} as const;

export interface phoneInterface {
    Body: FromSchema<typeof phoneSchema.body>,
    Reply: {
        200: FromSchema<typeof phoneSchema.response['200']>,
        400: FromSchema<typeof phoneSchema.response['400']>,
    }
}

export const certificatePhoneSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['phone','certificationCode','phoneCertificationToken'],
        properties: {
            phone: { type: 'string' },
            certificationCode: { type: 'string' },
            phoneCertificationToken: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                certificatedPhoneToken: { type: 'string' }
            }
        }
    }
};

export interface requestCertificatePhone{
    "phone": string;
    "certificationCode": string;
    "phoneCertificationToken": string;
}

export interface responseCertificatePhone{
    "certificatedPhoneToken": string;
}

export const loginSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['businessRegistrationNumber','certificatedPhoneToken'],
        properties: {
            businessRegistrationNumber: { type: 'string' },
            certificatedPhoneToken: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
            }
        }
    }
};


export interface requestLogin{
    "businessRegistrationNumber": string;
    "certificatedPhoneToken": string;
}

export interface responseLogin{
    "accessToken": string;
    "refreshToken": string;
}

export const refreshSchema ={
    tags: ['user'],
    summary: '사용자 휴대폰으로 인증번호 발송',
    headers:{
        type: 'object',
        properties: {
            authorization: { type: 'string' }
        },
        required: ['authorization']
    },
    response: {
        200: {
            type: 'object',
            description: 'success response',
            properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
            }
        },
        400: {
            type: 'object',
            description: 'Bad Request',
            properties: {
                error: { type: 'string' },
                message: { type: 'string' }
            }
        }
    }
} as const;

export interface refreshInterface {
    Headers: FromSchema<typeof refreshSchema.headers>,
    Reply: {
        200: FromSchema<typeof refreshSchema.response['200']>,
        '4xx': FromSchema<typeof refreshSchema.response['400']>,
    }
}
