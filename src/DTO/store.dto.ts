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

export interface requestStoreListHeader extends requestNewStoreHeader {}

export interface responseStoreList {
    stores: Array<{
        storeId: number;
        name: string;
        address: string;
    }>;
}
