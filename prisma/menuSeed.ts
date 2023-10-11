import * as fs from 'fs';
import * as path from 'path';

const csvData = fs.readFileSync(path.join(process.cwd(),'prisma', '소예다방.csv'), 'utf8');
const removedHeader = csvData.split('\n').slice(2).join('\n');
const menus = removedHeader.split('\n,,,,,\n');
const menuData = menus.map((menu) => {
  const rows = menu.split('\n');
  const name = rows[0].split(',')[0];
  const materials = rows.map((row) => {
    const [_,name, iceNormal, iceSizeUp, hotNormal, hotSizeUp] = row.split(',');
    return {
        name,
        iceNormal,
        iceSizeUp,
        hotNormal,
        hotSizeUp,
    };
  });
  return { name, materials };
});
