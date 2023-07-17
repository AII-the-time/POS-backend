FROM node:18

ENV DOCKERIZE_VERSION v0.2.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

WORKDIR /usr/src

COPY . .

RUN npm install

RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ./docker-entrypoint.sh

EXPOSE 3000
