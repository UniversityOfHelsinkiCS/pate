FROM registry.access.redhat.com/ubi8/nodejs-16-minimal

WORKDIR /opt/app-root/src

COPY package* ./
RUN curl -fsSL https://github.com/AikidoSec/safe-chain/releases/latest/download/install-safe-chain.sh | sh -s -- --ci
RUN npm ci -f

COPY . .

CMD ["npm", "start"]
