# Simple Node runtime
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install || true
COPY src ./src
COPY .env.example ./
EXPOSE 8080
CMD ["node", "src/index.js"]
