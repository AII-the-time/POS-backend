import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const materialRawData = fs.readFileSync(path.join(process.cwd(),'prisma', '소예다방-재료.csv'), 'utf8').toString().trim();
const materialData = materialRawData.split('\n').slice(2).map((row) => {
  const [name, amount, unit, price] = row.split(',');
  return {
      name,
      amount: parseInt(amount),
      unit,
      price
  };
});

const mixedMaterialRawData = fs.readFileSync(path.join(process.cwd(),'prisma', '소예다방-Mixed재료.csv'), 'utf8').toString().trim();
const mixedMaterialData = mixedMaterialRawData.split('\n').slice(2).join('\n').split('\n,,\n').map((material) => {
  const rows = material.split('\n');
  const name = rows[0].split(',')[0];
  const materials = rows.map((row) => {
    const [_,name, amount] = row.split(',');
    return {
        name,
        amount
    };
  });
  return { name, materials };
});

const menuRawData = fs.readFileSync(path.join(process.cwd(),'prisma', '소예다방-메뉴.csv'), 'utf8').toString().trim();
const menuData = menuRawData.split('\n').slice(3).join('\n').split('\n,,,,,,\n').map((menu) => {
  const rows = menu.split('\n');
  const name = rows[0].split(',')[0];
  const price = rows[0].split(',')[1];
  const materials = rows.map((row) => {
    const [_,__,name, ...amounts] = row.split(',');
    const [coldRegularAmount, coldSizeUpAmount, hotRegularAmount, hotSizeUpAmount] = amounts.map(Number);
    return {
        name,
        coldRegularAmount,
        coldSizeUpAmount,
        hotRegularAmount,
        hotSizeUpAmount
    };
  });
  return { name, price, materials };
});

export const printAllStocks = () => {
  const stocks = [...new Set([...new Set(menuData.flatMap((menu) => menu.materials.map((material) => material.name)))].flatMap((name) => {
    const materials = mixedMaterialData.find((material) => material.name === name)?.materials;
    if(!materials) return name;
    return materials.map((material) => material.name);
  }))];

  console.log(stocks.join('\n'));
}

export default async (prisma: PrismaClient, storeId: number) => {
  const materials = await Promise.all(materialData.map(async (material) => {
    return await prisma.stock.create({
      data: {
        name: material.name,
        amount: isNaN(material.amount)?undefined:material.amount,
        unit: material.unit===""?undefined:material.unit,
        price: material.price===""?undefined:material.price,
        storeId
      }
    });
  }));

  const mixedMaterialDataWithMaterials = mixedMaterialData.map((material) => {
    return {
      name: material.name,
      materials: material.materials.map((material) => {
        const stock = materials.find((stock) => stock.name === material.name);
        if(!stock) throw new Error(`Stock not found: ${material.name}`);
        return {
          name: stock.name,
          amount: material.amount,
          stockId: stock.id
        };
      })
    };
  });
  const mixedMaterials = await Promise.all(mixedMaterialDataWithMaterials.map(async (material) => {
    return await prisma.mixedStock.create({
      data: {
        name: material.name,
        storeId,
        mixings: {
          create: material.materials.map((material) => ({
            amount: parseInt(material.amount),
            stockId: material.stockId,
          }))
        }
      }
    });
  }));

  const menuDataWithMaterials = menuData.map((menu) => {
    return {
      name: menu.name,
      price: menu.price,
      materials: menu.materials.map((material) => {
        let stock:{id:number}|undefined= materials.find((stock) => stock.name === material.name);
        if(!stock) {
          stock = mixedMaterials.find((stock) => stock.name === material.name);
          if(!stock) throw new Error(`Stock not found: ${material.name}`);
        }
        return {
          name: material.name,
          coldRegularAmount: material.coldRegularAmount,
          coldSizeUpAmount: material.coldSizeUpAmount,
          hotRegularAmount: material.hotRegularAmount,
          hotSizeUpAmount: material.hotSizeUpAmount,
          stockId: stock.id
        };
      })
    };
  });
  const category3 = await prisma.category.create({
    data: {
      id: 3,
      storeId,
      name: '미분류',
      sort: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const menus = await Promise.all(menuDataWithMaterials.map(async (menu,index) => {
    return await prisma.menu.create({
      data: {
        name: menu.name,
        price: menu.price,
        categoryId: 3,
        sort: index+1,
        storeId,
        recipes: {
          create: menu.materials.map((material) => ({
            coldRegularAmount: material.coldRegularAmount,
            coldSizeUpAmount: material.coldSizeUpAmount,
            hotRegularAmount: material.hotRegularAmount,
            hotSizeUpAmount: material.hotSizeUpAmount,
            stockId: material.stockId,
          }))
        }
      }
    });
  }));
}
