FROM --platform=$BUILDPLATFORM node:18-alpine as base
WORKDIR /app
COPY package.json /
EXPOSE 3000



FROM base as production

ENV NODE_ENV=production
RUN npm install -g husky
COPY . /app
CMD node index.js

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon
COPY . /app
CMD npm run start
