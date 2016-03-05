FROM node:5
COPY package.json /
RUN npm install
COPY . /app
WORKDIR /app
RUN wget -O /usr/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.0.0/dumb-init_1.0.0_amd64
RUN chmod +x /usr/bin/dumb-init
RUN /node_modules/.bin/webpack
