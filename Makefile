.PHONY: run
run:
	gunicorn server.main:app -b 127.0.0.1:8080 -k gevent

.PHONY: publish
publish:
	gcloud app deploy

.PHONY: proxy
proxy:
	~/Downloads/cloud_sql_proxy -instances=elevated-agent-171907:us-west1:website-0=tcp:3306

.PHONY: connect
connect:
	gcloud sql connect website-0 --user=root

setup: setup-python setup-node

setup-python: requirements.txt
	pip install gevent
	pip install -r requirements.txt

setup-node: react/package.json
	cd react && npm install

build: build/bundle.js

build/bundle.js: react/package.json react/webpack.config.js react/*.jsx react/components/*.jsx
	cd react && ./node_modules/.bin/webpack
