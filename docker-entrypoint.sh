echo "wait db server"
dockerize -wait tcp://db:3306 -timeout 20s

echo "start node server"
npm run prisma
npm run seed
npm run dev
