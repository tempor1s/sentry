#
# Builder stage.
# This state compile our TypeScript to get the JavaScript code
#
FROM node:lts AS builder

# install dependencies
RUN apt-get update && \
  apt-get install -y python3

# set the working directory 
WORKDIR /usr/sentry

# copy all the stuff that we need for the build and install context
COPY package*.json ./
COPY tsconfig*.json ./
COPY . ./sentry

# install all the things for production with no cache and then build all the code into /usr/sentry/build
RUN npm ci --quiet && npm run build

#
# Production stage.
# This state compile get back the JavaScript code from builder stage
# It will also install the production package only
#
FROM node:lts-alpine

# expose 8080 since this is the production stage that will be run
EXPOSE 8080

# set context to /usr/sentry and then set the node environment to be production
WORKDIR /sentry
ENV NODE_ENV=production

# copy the package json and lock because we need to install them again
COPY package*.json ./
RUN npm ci --quiet --only=production
# install pm2 which is a production process manager for our application
RUN npm i -g pm2

## We just need the build to execute the command
COPY --from=builder /usr/sentry/build ./build

# use pm2 to run our built application from the previous stage
CMD ["pm2-runtime", "build/index.js"]
