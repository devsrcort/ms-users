# Alpine Linux-based, tiny Node container:
FROM node:12-alpine3.9 as base

ADD ./ /opt/app
WORKDIR /opt/app

USER root

RUN rm -rf node_modules \
 && chown -R node /opt/app

# USER node


FROM base as release

USER root
RUN npm install --only=production \
 #&& apk add --no-cache tini \
 && chown -R node /opt/app
RUN chmod 755 ./shell/run-db-migration.sh

USER node
ENV HOME_DIR=/opt/app \
    NODE_ENV=production \
    PORT=5501

ENTRYPOINT ./shell/run-db-migration.sh && node server.js

FROM base as build

USER root
RUN npm install -g nodemon \
 && npm install \
 && chown -R node /opt/app
RUN chmod 755 ./shell/run-db-migration.sh
RUN chmod 755 ./shell/add-crontab.sh
RUN chmod 755 ./shell/updateDb && cp ./shell/updateDb /etc/periodic/daily
RUN apk add --update busybox-suid

USER node
ENV PORT=5501

ENTRYPOINT ./shell/add-crontab.sh && ./shell/run-db-migration.sh && node server.js
