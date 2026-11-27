# Front (React + Vite) servido pelo Caddy, que também faz proxy de /api/* para a API.
# Build: docker build -t madereira-web ./frontend

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Mesma origem do front: o Caddy encaminha /api/* para a API (sem CORS, sem URL fixa no build).
ENV VITE_API_URL=/api
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
EXPOSE 80
