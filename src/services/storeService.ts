import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import * as Store from "../DTO/store.dto";
import { LoginToken } from "../utils/jwt";

const prisma = new PrismaClient();

export default {
    async newStore({authorization}: Store.requestNewStoreHeader, {name, address, openingHours}: Store.requestNewStore): Promise<Store.responseNewStore> {
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
                defaultOpeningHours: openingHours,
                user: {
                    connect: {
                        id: userId
                    }
                }
            }
        });

        return {storeId: store.id};
    }

}

