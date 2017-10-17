FROM node:6-alpine

RUN mkdir -p /usr/src/app/
WORKDIR /usr/src/app/

COPY package.json .
RUN npm install

COPY index.js .
COPY newrelic.js .
COPY views /usr/src/app/views

EXPOSE 3000

CMD [ "node", "index.js" ]
