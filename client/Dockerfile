FROM node:latest
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app/
COPY /etc/hosts /etc/
COPY /etc/docker/daemon.json /etc/docker/

RUN npm install -g tsc \
    && npm install -g typescript \
    && npm install
COPY . /app
EXPOSE 3000
CMD [ "npm", "start" ]