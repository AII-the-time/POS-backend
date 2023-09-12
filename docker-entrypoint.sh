echo "wait db server"
./wait-for-it.sh  $DB_HOST:$DB_PORT

echo "start node server"
npm run prisma
npm run seed
npm run dev
