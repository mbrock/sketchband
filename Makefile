NAME ?= sketchband
PORT ?= 1967

build:; node_modules/.bin/webpack
serve:; node_modules/.bin/http-server -c-1 ./dist
serve-https:; node_modules/.bin/http-server -c-1 -S \
  -C $(SSL_CERT) -K $(SSL_KEY) ./dist

build-docker:; docker build -t $(NAME) .

# Assumes a LetsEncrypt-style setup...
start-docker-https: build-docker
	docker run --rm -it \
	  -p 443:443 \
	  -v $(SSL_PATH):/ssl \
          --name $(NAME) $(NAME) \
	  dumb-init /node_modules/.bin/http-server -p 443 -c-1 -S \
	    -C/ssl/live/$(HOSTNAME)/fullchain.pem \
	    -K/ssl/live/$(HOSTNAME)/privkey.pem \
	    ./dist

# Serves $(FILES) over HTTPS on port 1967...
start-file-server:
	docker run --rm -it \
	  -p 1967:443 \
	  -v $(SSL_PATH):/ssl \
          -v $(FILES):/files \
	  --name $(NAME)-files $(NAME) \
	  dumb-init /node_modules/.bin/http-server -p 443 -c 9999 -S \
	    -C/ssl/live/$(HOSTNAME)/fullchain.pem \
	    -K/ssl/live/$(HOSTNAME)/privkey.pem \
	    /files
