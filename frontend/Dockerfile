#
# Builder stage.
# This state compile our TypeScript to get the JavaScript code
#
FROM node:lts AS builder

WORKDIR /usr/src/app

# copy all the required stuff into your builder
COPY package*.json ./
COPY tsconfig*.json ./
COPY ./server ./server
COPY ./pages ./pages

# install all the required packages and build the code (since typescript :))
RUN npm ci --quiet && npm run build

#
# Production stage.
# This state compile get back the JavaScript code from builder stage
# It will also install the production package only
#
FROM node:lts-alpine

EXPOSE 3000

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --quiet --only=production
RUN npm i -g pm2

## We just need the build to execute the command and nextjs stuff
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/.next ./.next

CMD ["pm2-runtime", "build/index.js"]
