import { Category, Menu, Option, Prisma } from '@prisma/client';
export type CategoryWithMenuWithOption = Category & {
  menu: (Menu & { option: Option[] })[];
};

type option = {
  optionType: string;
  options: Array<{
    id: number;
    name: string;
    price: Prisma.Decimal;
  }>;
};

export class MenuResponse {
  id: number;
  name: string;
  price: Prisma.Decimal;
  option: option[];
  constructor(menu: Menu & { option: Option[] }) {
    this.id = menu.id;
    this.name = menu.name;
    this.price = menu.price;
    this.option = menu.option
      .map((option) => ({
        optionType: option.optionCategory,
        options: [
          {
            id: option.id,
            name: option.optionName,
            price: option.optionPrice,
          },
        ],
      }))
      .reduce((acc, cur) => {
        const idx = acc.findIndex(
          (option) => option.optionType === cur.optionType
        );
        if (idx === -1) {
          acc.push(cur);
        } else {
          acc[idx].options.push(...cur.options);
        }
        return acc;
      }, [] as unknown as option[]);
  }
}

export class MenuList {
  categories: Array<{
    category: string;
    menus: MenuResponse[];
  }>;

  constructor(categories: CategoryWithMenuWithOption[]) {
    this.categories = categories.map((category) => ({
      category: category.name,
      menus: category.menu.map((menu) => new MenuResponse(menu)),
    }));
  }
}
