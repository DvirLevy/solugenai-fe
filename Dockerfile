# syntax=docker/dockerfile:1

# Single stage: builds the app and serves it with Vite's own preview server
# (no nginx or other extra runtime to install/explain — same toolchain as
# local dev, and it already handles the SPA fallback for deep links like
# /dashboard on a refresh).
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines env vars at build time, so this must be a build arg, not a
# runtime environment variable passed to `docker run`.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
