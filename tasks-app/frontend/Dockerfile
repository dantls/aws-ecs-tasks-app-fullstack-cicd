FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_OPTIONS=--openssl-legacy-provider
ENV DISABLE_ESLINT_PLUGIN=true

EXPOSE 3000

# Development mode - uses proxy from package.json
CMD ["npm", "start"]
