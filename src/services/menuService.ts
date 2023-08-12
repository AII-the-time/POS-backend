import { PrismaClient,Menu,OptionMenu,Option } from "@prisma/client";
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
                    },
                    include: {
                        optionMenu: {
                            include: {
                                option: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                sort: 'asc'
            }
        });
        const newCategories = categories.map((category) => {
            return {
                ...category,
                menu: category.menu.map((menu:Menu&{optionMenu:OptionMenu[]}) => {
                const newMenu:Menu&{option:Option[],optionMenu?:any} = {
                    ...menu,
                    option: menu.optionMenu.flatMap((optionMenu:any) => optionMenu.option)
                }
                delete newMenu.optionMenu;
                return newMenu;
            })
            }
        });
        return new MenuList(newCategories);
    }
}
