NAME ?= sketchband
PORT ?= 1967

build:; node_modules/.bin/webpack
serve:; node_modules/.bin/http-server -c-1 ./dist

start-docker: build-docker
	docker run --rm -it --name $(NAME) \
	  -p $(PORT):1967 -v `pwd`:/app $(NAME)
build-docker:; docker build -t $(NAME) .
