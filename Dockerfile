FROM node:5
COPY package.json /
RUN wget https://github.com/Yelp/dumb-init/releases/download/v1.0.0/dumb-init_1.0.0_amd64
RUN chmod +x dumb-init
RUN npm install
COPY . /app
WORKDIR /app
RUN /node_modules/.bin/webpack
