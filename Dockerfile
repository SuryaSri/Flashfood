FROM node:carbon

WORKDIR /Flashfood

ADD . /Flashfood

RUN npm install express
RUN npm install request
RUN npm install apiai
RUN npm install bluebird

EXPOSE 5000

ENV NAME node-sever

CMD ["node","Flashbot.js"]
