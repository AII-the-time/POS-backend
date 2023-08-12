import { Mileage as prismaMileage } from "@prisma/client";
export type Mileage = prismaMileage;

export interface requestGetMileage{
    phone: string;
}

export interface responseGetMileage{
    mileageId: number;
    mileage: number;
}

export interface requestRegisterMileage{
    phone: string;
}

export interface responseRegisterMileage{
    mileageId: number;
}
