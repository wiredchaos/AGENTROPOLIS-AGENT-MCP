FROM node:22-alpine
RUN addgroup -S agentropolis && adduser -S -G agentropolis agentropolis
WORKDIR /app
COPY package.json ./
COPY src ./src
RUN mkdir -p /app/data && chown -R agentropolis:agentropolis /app
USER agentropolis
EXPOSE 8787
CMD ["node", "src/server.js"]
