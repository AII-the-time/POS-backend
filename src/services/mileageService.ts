import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "@errors";
import { LoginToken } from "@utils/jwt";
import * as Mileage from "@DTO/mileage.dto";
const prisma = new PrismaClient();

export default {
    async getMileage({authorization, storeid}: Mileage.getMileageInterface['Headers'], { phone }: Mileage.getMileageInterface['Querystring']): Promise<Mileage.getMileageInterface['Reply']['200']> {
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
            throw new NotFoundError("해당하는 마일리지가 없습니다.","마일리지");
        }
        return {mileageId: mileage.id, mileage: mileage.mileage};
    },

    async registerMileage({authorization, storeid}: Mileage.registerMileageInterface['Headers'], { phone }: Mileage.registerMileageInterface['Body']): Promise<Mileage.registerMileageInterface['Reply']['200']> {
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }

        const mileage = await prisma.mileage.create({
            data: {
                phone: phone,
                mileage: 0,
                storeId: Number(storeid),
            }
        });

        return {mileageId: mileage.id};
    },

    async saveMileage({authorization, storeid}: Mileage.saveMileageInterface['Headers'], { mileageId, mileage }: Mileage.saveMileageInterface['Body']): Promise<Mileage.saveMileageInterface['Reply']['200']> {
        authorization = authorization.replace("Bearer ", "");
        let userId: number;
        try{
            userId = LoginToken.getUserId(authorization);
        }catch(e){
            throw new Error("토큰이 유효하지 않습니다.");
        }

        const savedMileage = await prisma.mileage.update({
            where: {
                id: mileageId,
            },
            data: {
                mileage: {
                    increment: mileage,
                }
            }
        });

        return {mileage: savedMileage.mileage};
    }
}
