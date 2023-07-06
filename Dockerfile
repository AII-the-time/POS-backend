FROM node:18

WORKDIR /usr/src

COPY . .

RUN npm install

EXPOSE 3000
CMD [ "npm", "run", "dev" ]
