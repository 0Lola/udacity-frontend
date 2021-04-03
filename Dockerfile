FROM node:13

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH


# install and cache app dependencies
COPY package.json /usr/src/app/package.json
# install ionic
RUN npm install -g ionic
RUN npm install -g bower
RUN npm install -g gulp
RUN npm install

# add app
COPY . /usr/src/app

EXPOSE 4200

CMD ["ionic","build"]
CMD ["ionic","serve","--address", "0.0.0.0"]
