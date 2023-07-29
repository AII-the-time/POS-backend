import { Category, Menu } from "@prisma/client";
type CategoryWithMenu = Category & { menu: Menu[] };

class MenuResponse {
    id: number;
    name: string;
    price: number;
    constructor(menu: Menu) {
        this.id = menu.id;
        this.name = menu.name;
        this.price = menu.price;
    }
}


export class MenuList {
    categories: Array<{
        category: string;
        menus: MenuResponse[];
    }>;

    constructor(categories: CategoryWithMenu[]) {
        this.categories = categories
            .map(category => (
                {
                    category: category.name,
                    menus: category.menu.map(menu => new MenuResponse(menu))
                }
            ))
    }
}
