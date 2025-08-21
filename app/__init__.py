import os
from flask import Flask
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, 'instance', 'appointments.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 

    db.init_app(app)

    # Import and register blueprints
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

from . import models
__all__ = ["create_app", "db"]
