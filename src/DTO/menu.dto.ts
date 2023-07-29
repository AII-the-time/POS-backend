interface Menu {
    id: number;
    name: string;
    price: number;
}

export type MenuList = {
    categories: Array<{
        category: string;
        menus: Menu[];
    }>;
}
