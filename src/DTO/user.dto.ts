import { User as prismaUser } from '@prisma/client';
export type User = prismaUser;

export interface requestPhone{
    "phone": string;
}

export interface responsePhone{
    "tokenForCertificatePhone": string;
}

export interface requestCertificatePhone{
    "phone": string;
    "certificationCode": string;
    "phoneCertificationToken": string;
}

export interface responseCertificatePhone{
    "certificatedPhoneToken": string;
}

export interface requestLogin{
    "businessRegistrationNumber": string;
    "certificatedPhoneToken": string;
}

export interface responseLogin{
    "accessToken": string;
    "refreshToken": string;
}

export interface requestRefreshHeader{
    "authorization": string;
}

export interface responseRefresh extends responseLogin{}
