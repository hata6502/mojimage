FROM node:24 AS development

USER node
WORKDIR /home/node/app

CMD ["npm", "start"]


FROM development

COPY package.json package-lock.json ./
RUN npm install

COPY ./ ./
RUN npm run build
