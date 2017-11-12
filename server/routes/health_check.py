def add(app):
    @app.route("/_ah/health")
    def health_check():
        return "OK"
