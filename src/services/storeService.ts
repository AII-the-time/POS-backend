import { PrismaClient } from "@prisma/client";
import * as Store from "@DTO/store.dto";
import { LoginToken } from "@utils/jwt";

const prisma = new PrismaClient();

export default {
    async newStore({authorization}: Store.newStoreInterface['Headers'], {name, address, openingHours}: Store.newStoreInterface['Body']): Promise<Store.newStoreInterface['Reply']['200']> {
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }

        const store = await prisma.store.create({
            data: {
                name: name,
                address: address,
                defaultOpeningHours: openingHours as any,
                user: {
                    connect: {
                        id: userId
                    }
                }
            }
        });

        return {storeId: store.id};
    },

    async getStoreList({authorization}: Store.storeListInterface['Headers']): Promise<Store.storeListInterface['Reply']['200']> {
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }

        const stores = await prisma.store.findMany({
            where: {
                userId: userId
            },
            select: {
                id: true,
                name: true,
                address: true
            }
        });

        return {
            stores: stores
                .map(store => ({
                    storeId: store.id,
                    name: store.name,
                    address: store.address
                }))
        };
    }
}

