import { PrismaClient } from "@prisma/client";
import { StoreAuthorizationHeader } from "../DTO/index.dto";
import { MenuList } from "../DTO/menu.dto";
import { LoginToken } from "../utils/jwt";

const prisma = new PrismaClient();

export default {
    async getMenus({authorization, storeid}: StoreAuthorizationHeader): Promise<MenuList> {
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }
        const categories = await prisma.category.findMany({
            where: {
                storeId: Number(storeid)
            },
            include: {
                menu: {
                    orderBy: {
                        sort: 'asc'
                    }
                }
            },
            orderBy: {
                sort: 'asc'
            }
        });
        return new MenuList(categories);
    }
}
