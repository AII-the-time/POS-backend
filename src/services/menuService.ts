import Menu from "../models/Menu";

export default {
    async getMenu(): Promise<Menu[]>{
        const menu: Menu[] = [
            new Menu('Pizza', 10),
            new Menu('Pasta', 5),
            new Menu('Burger', 8)
        ];
        return menu;
    }
}
