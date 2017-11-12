import bottle


def add(app):
    @app.route("<url:re:(?!/api)(?!/static).+>")
    def main(url):
        return bottle.static_file(
            "index.html",
            root="build",
        )

    @app.route("/favicon.ico")
    def favicon():
        return bottle.static_file(
            "favicon.ico",
            root="build",
        )

    @app.route("/bundle.js")
    def bundle():
        response = bottle.static_file(
            "bundle.js",
            root="build",
        )
        response.headers["Cache-Control"] = "no-cache"
        return response

    @app.route("/style.css")
    def css():
        response = bottle.static_file(
            "style.css",
            root="build",
        )
        response.headers["Cache-Control"] = "no-cache"
        return response

    @app.route("/static/<file:path>")
    def static(file):
        response = bottle.static_file(
            file,
            root="build/static",
        )
        return response
