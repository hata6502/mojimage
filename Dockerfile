FROM node:24 AS development

USER node
WORKDIR /home/node/app

CMD ["npm", "start"]


FROM development

COPY --chown=node:node package.json package-lock.json ./
RUN npm install

COPY --chown=node:node ./ ./
RUN npm run build
