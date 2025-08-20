from flask import Flask
from datetime import datetime

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')  # Load settings
    

    # Import and register blueprints (routes)
    from app.routes.routes import routes_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(routes_bp)
    app.register_blueprint(admin_bp)

    @app.context_processor
    def inject_common():
        return {
            "current_year": datetime.utcnow().year,
            "config": app.config
        }

    return app
