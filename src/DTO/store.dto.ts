import { Store as prismaStore } from '@prisma/client';
export type Store = prismaStore;

export interface requestNewStoreHeader {
    authorization: string;
}

export interface requestNewStore {
    name: string;
    address: string;
    openingHours: Array<{
        day: string,
        open: string|null,
        close: string|null,
    }>;
}

export interface responseNewStore {
    storeId: number;
}
