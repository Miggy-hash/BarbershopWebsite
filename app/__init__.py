from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')  # Load settings

    # Import and register blueprints (routes)
    from app.routes.routes import routes_bp
    app.register_blueprint(routes_bp)

    return app
