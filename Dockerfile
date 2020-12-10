FROM koumoul/webapp-base:1.10.2
MAINTAINER "contact@koumoul.com"

ARG VERSION
ENV VERSION=$VERSION
ENV NODE_ENV production
WORKDIR /webapp
ADD LICENSE .
ADD package.json .
ADD package-lock.json .
RUN npm install --production

ADD config config

# Adding UI
ADD nuxt.config.js .
ADD public public
ADD contract contract
RUN npm run build

# Adding server files
ADD server server
ADD README.md .

VOLUME /webapp/data
EXPOSE 8080

CMD ["node", "server"]
