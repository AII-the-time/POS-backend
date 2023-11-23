import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
const materialRawData = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '소예다방-재료.csv'), 'utf8').toString().trim();
const materialData = materialRawData.split('\n').slice(2).map((row) => {
  const [name, amount, unit, price] = row.split(',');
  return {
      name,
      amount: parseInt(amount),
      unit,
      price:price===""?Math.floor(Math.random() * 10000+2000).toString():price
  };
});

const mixedMaterialRawData = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '소예다방-Mixed재료.csv'), 'utf8').toString().trim();
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

const menuRawData = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '소예다방-메뉴.csv'), 'utf8').toString().trim();
const menuData = menuRawData.split('\n').slice(3).join('\n').split('\n,,,,,,,\n').map((menu) => {
  const rows = menu.split('\n');
  const name = rows[0].split(',')[0];
  const price = rows[0].split(',')[1];
  const category = rows[0].split(',')[2];
  const materials = rows.map((row) => {
    const [_,__,___,name, ...amounts] = row.split(',');
    const [coldRegularAmount, coldSizeUpAmount, hotRegularAmount, hotSizeUpAmount] = amounts.map(Number);
    return {
        name,
        coldRegularAmount,
        coldSizeUpAmount,
        hotRegularAmount,
        hotSizeUpAmount
    };
  });
  return { name, price, category, materials };
});

const categoryData = [...new Set(menuData.map((menu) => menu.category))];

const getDateBeforeToday = (days: number, time: number,minites: number):Date => {
  const date = new Date(new Date().getTime() - days * 24 * 60 * 60 * 1000);
  return new Date(`${date.toISOString().split('T')[0]}T0${time}:${minites+10}:00.000Z`);
}

export const printAllStocks = () => {
  const stocks = [...new Set([...new Set(menuData.flatMap((menu) => menu.materials.map((material) => material.name)))].flatMap((name) => {
    const materials = mixedMaterialData.find((material) => material.name === name)?.materials;
    if(!materials) return name;
    return materials.map((material) => material.name);
  }))];

  console.log(stocks.join('\n'));
}

export default async (prisma: PrismaClient, storeId: number) => {
  await prisma.stock.createMany({
    data: materialData.map((material) => ({
      name: material.name,
      amount: isNaN(material.amount)?undefined:material.amount,
      currentAmount: material.name=="물"?-1:Math.floor(Math.random() * 2500+500),
      noticeThreshold: Math.floor(Math.random() * 500+500),
      unit: material.unit,
      price: material.price,
      storeId
    }))
  });
  const materials = await prisma.stock.findMany({
    where: {
      storeId
    }
  });

  await prisma.stockHistory.createMany({
    data: materials.filter(({name})=>name!="물").map((material) => ({
      stockId: material.id,
      amount: material.amount!,
      price: Math.floor(material.price!.toNumber()-Math.random() * 1800).toString(),
      createdAt: new Date(new Date().getTime() - 48 * 24 * 60 * 60 * 1000),
    })).concat(materials.filter(({name})=>name!="물").map((material) => ({
      stockId: material.id,
      amount: material.amount!,
      price: Math.floor(material.price!.toNumber()-Math.random() * 1000).toString(),
      createdAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
    }))).concat(materials.filter(({name})=>name!="물").map((material) => ({
      stockId: material.id,
      amount: material.amount!,
      price: material.price!.toString(),
      createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
    })))
  });

  const mixedMaterialDataWithMaterials = mixedMaterialData.map((material) => {
    return {
      name: material.name,
      totalAmount: material.materials.reduce((acc, cur) => acc + parseInt(cur.amount), 0),
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
  await prisma.mixedStock.createMany({
    data: mixedMaterialDataWithMaterials.map((material,index) => ({
      name: material.name,
      unit: 'g',
      totalAmount: material.totalAmount,
      storeId
    }))
  });
  const mixedStocks = await prisma.mixedStock.findMany({
    where: {
      storeId
    }
  });
  await prisma.mixing.createMany({
    data: mixedMaterialDataWithMaterials.flatMap((material,index) => material.materials.map((material) => ({
      amount: parseInt(material.amount),
      mixedStockId: mixedStocks[index].id,
      stockId: material.stockId
    })))
  });

  const mixedMaterials = await prisma.mixedStock.findMany({
    where: {
      storeId
    },
    include: {
      mixings: {
        include: {
          stock: true
        }
      }
    }
  });

  const menuDataWithMaterials = menuData.map((menu) => {
    return {
      name: menu.name,
      price: menu.price,
      category: menu.category,
      materials: menu.materials.map((material) => {
        const stock = materials.find((stock) => stock.name === material.name);
        if(stock) {
          return {
            name: material.name,
            coldRegularAmount: material.coldRegularAmount,
            coldSizeUpAmount: material.coldSizeUpAmount,
            hotRegularAmount: material.hotRegularAmount,
            hotSizeUpAmount: material.hotSizeUpAmount,
            stockId: stock.id
          };
        }
        const mixedStock = mixedMaterials.find((stock) => stock.name === material.name);
        if(!mixedStock) throw new Error(`Stock not found: ${material.name}`);
        return {
          name: material.name,
          coldRegularAmount: material.coldRegularAmount,
          coldSizeUpAmount: material.coldSizeUpAmount,
          hotRegularAmount: material.hotRegularAmount,
          hotSizeUpAmount: material.hotSizeUpAmount,
          mixedStockId: mixedStock.id
        };
      })
    };
  });
  await prisma.category.createMany({
    data: categoryData.map((category,index) => ({
      name: category,
      sort: index+3,
      storeId
    }))
  });
  const categoies = await prisma.category.findMany({
    where: {
      storeId
    }
  });
  await prisma.menu.createMany({
    data: menuDataWithMaterials.map((menu,index) => ({
      name: menu.name,
      price: menu.price,
      categoryId: categoies.find((category) => category.name === menu.category)!.id,
      sort: index+1,
      storeId,
    }))
  });

  const menus = await prisma.menu.findMany({
    where: {
      storeId
    }
  });

  await prisma.recipe.createMany({
    data: menuDataWithMaterials.flatMap((menu) => menu.materials.map((material) => ({
      coldRegularAmount: material.coldRegularAmount,
      coldSizeUpAmount: material.coldSizeUpAmount,
      hotRegularAmount: material.hotRegularAmount,
      hotSizeUpAmount: material.hotSizeUpAmount,
      menuId: menus.find((menu2) => menu2.name === menu.name)!.id,
      stockId: material.stockId,
      mixedStockId: material.mixedStockId
    })))
  });

  await prisma.mileage.createMany({
    data: new Array(80).fill(0).map((_, index) => ({
      storeId,
      mileage: 0,
      phone: `010100000${10+index}`,
    }))
  });

  const mileages = await prisma.mileage.findMany({
    where: {
      storeId
    }
  });

  const preOrderItems = new Array(50).fill(0).map((_, index) => new Array(Math.floor(Math.random() * 5)+1).fill(0).map((_, index) => ({
    menu: menus[Math.floor(Math.random() * menus.length)],
    count: Math.floor(Math.random() * 3)+1,
  })));

  await prisma.preOrder.createMany({
    data: preOrderItems.map((orderItem, index) => ({
      storeId,
      totalPrice: orderItem.reduce((acc, cur) => acc + cur.menu.price.toNumber() * cur.count, 0).toString(),
      createdAt: getDateBeforeToday(30,0,0),
      phone: `010${Math.floor(Math.random() * 100000000).toString().padStart(10, '0')}`,
      orderedFor: getDateBeforeToday(Math.floor(Math.random() * 30),Math.floor(Math.random() * 9),Math.floor(Math.random() * 49)),
      deletedAt: new Date()
    }))
  });

  await prisma.preOrderItem.createMany({
    data: preOrderItems.flatMap((orderItem, index) => orderItem.map((orderItem) => ({
      preOrderId: index+1,
      menuId: orderItem.menu.id,
      count: orderItem.count
    })))
  });

  const preOrders = await prisma.preOrder.findMany({
    where: {
      storeId
    }
  });

  const orderItems = new Array(200).fill(0).map((_, index) => new Array(Math.floor(Math.random() * 5)+1).fill(0).map((_, index) => ({
    menu: menus[Math.floor(Math.random() * menus.length)],
    count: Math.floor(Math.random() * 3)+1,
  })));

  await prisma.order.createMany({
    data: orderItems.map((orderItem, index) => ({
      storeId,
      paymentStatus: 'PAID',
      totalPrice: orderItem.reduce((acc, cur) => acc + cur.menu.price.toNumber() * cur.count, 0).toString(),
      mileageId: Math.floor(Math.random() * 5)>0?mileages[Math.floor(Math.random() * mileages.length)].id:undefined,
      useMileage: 0,
      saveMileage: 0,
      createdAt: getDateBeforeToday(Math.floor(Math.random() * 30),Math.floor(Math.random() * 9),Math.floor(Math.random() * 49)),
      preOrderId: undefined as number | undefined
    })).concat(
      preOrders.map((order) => ({
        storeId,
        paymentStatus: 'PAID',
        totalPrice: order.totalPrice.toString(),
        mileageId: Math.floor(Math.random() * 5)>0?mileages[Math.floor(Math.random() * mileages.length)].id:undefined,
        useMileage: 0,
        saveMileage: 0,
        createdAt: order.orderedFor,
        preOrderId: order.id
      }))
    )
  });

  const orders = await prisma.order.findMany({
    where: {
      storeId
    }
  });

  const orderItemsWithPreOrder = orderItems.concat(preOrderItems);

  await prisma.orderItem.createMany({
    data: orders.flatMap((order,index) => orderItemsWithPreOrder[index].map((orderItem) => ({
      orderId: order.id,
      menuId: orderItem.menu.id,
      count: orderItem.count
    })))
  });

  await prisma.payment.createMany({
    data: orders.map((order) => ({
      orderId: order.id,
      paymentMethod: ['CARD', 'CASH', 'BANK'][Math.floor(Math.random() * 3)],
      price: order.totalPrice,
      createdAt: order.createdAt,
    }))
  });
}
