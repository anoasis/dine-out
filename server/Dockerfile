FROM node:latest
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app/

RUN npm install -g tsc \
    && npm install -g typescript \
    && npm install
COPY . /app
EXPOSE 8080
EXPOSE 8081
CMD [ "npm", "start" ]