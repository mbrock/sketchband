NAME ?= sketchband
PORT ?= 1967

build:; node_modules/.bin/webpack
serve:; node_modules/.bin/http-server -c-1 ./dist
serve-https:; node_modules/bin/http-server -c-1 -S \
  -C $(SSL_CERT) -K $(SSL_KEY) ./dist

start-docker: build-docker
	docker run --rm -it --name $(NAME) \
	  -p $(PORT):1967 -v `pwd`:/app $(NAME)
build-docker:; docker build -t $(NAME) .
