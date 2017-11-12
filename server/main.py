import bottle

from server import routes


app = bottle.Bottle()
routes.books.add(app)
routes.health_check.add(app)
routes.static.add(app)
routes.stats.add(app)


def redirect_http_to_https(callback):
    """Bottle plugin that redirects all http requests to https"""

    def wrapper(*args, **kwargs):
        scheme = bottle.request.urlparts[0]
        if scheme == "http":
            # request is http; redirect to https
            bottle.redirect(bottle.request.url.replace("http", "https", 1))
        else:
            # request is already https; okay to proceed
            return callback(*args, **kwargs)
    return wrapper

# app.install(redirect_http_to_https)


if __name__ == "__main__":
    bottle.run(app, host="localhost", port=8080)
