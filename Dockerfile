FROM registry.access.redhat.com/ubi8/nodejs-16

WORKDIR /opt/app-root/src

COPY package* ./

RUN npm ci -f

COPY . .

CMD ["npm", "start"]
