NAME ?= sketchband
PORT ?= 1967
start: build
	docker run --rm -it --name $(NAME) \
	  -p $(PORT):1967 -v `pwd`:/app $(NAME)
build:; docker build -t $(NAME) .
