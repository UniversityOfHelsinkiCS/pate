FROM node:26-alpine
WORKDIR /opt/app-root/src

COPY package* .npmrc ./
RUN npm ci

COPY . .

CMD ["node", "index.js"]
