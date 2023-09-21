FROM node:18.16.0-alpine

RUN apk add --no-cache \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --no-default-rc \
    --skip-integrity-check \
    --prefer-offline \
    --ignore-optional \
    --prod \
    --pure-lockfile \
    --link-duplicates \
    --silent  \
    --no-progress  \
    --non-interactive  \
    --no-node-version-check \
    && yarn cache clean


COPY . .

RUN yarn build

EXPOSE 1337
CMD ["yarn", "start"]
