echo "wait db server"
./wait-for-it.sh  $DB_HOST:$DB_PORT

echo "start node server"
if [ "$NODE_ENV" = "production" ]; then
    echo "production mode"
    npm run prisma:generate
else
    npm run prisma
    npm run seed
fi
npm run dev
