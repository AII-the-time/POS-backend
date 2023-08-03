import { PrismaClient } from "@prisma/client";
import { StoreAuthorizationHeader } from "../DTO/index.dto";
import { LoginToken } from "../utils/jwt";
import * as Mileage from "../DTO/mileage.dto";
const prisma = new PrismaClient();

export default {
    async getMileage({authorization, storeid}: StoreAuthorizationHeader, { phone }: Mileage.requestGetMileage ): Promise<Mileage.responseGetMileage> {
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }
        
        const mileage = await prisma.mileage.findFirst({
            where: {
                phone: phone,
                storeId: Number(storeid),
            }
        });

        if(!mileage) {
            throw new Error("해당하는 마일리지가 없습니다.");
        }
        return {mileageId: mileage.id, mileage: mileage.mileage};
    }

}
