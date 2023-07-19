echo "wait db server"
./wait-for-it.sh db:3306

echo "start node server"
npm run prisma
npm run seed
npm run dev
