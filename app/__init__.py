import os
from flask import Flask
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_basicauth import BasicAuth


db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # ----------------- DATABASE SETUP -----------------
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, 'instance', 'appointments.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'super-secret-key'  # Required by Flask-Admin

    db.init_app(app)

    # ----------------- BLUEPRINT REGISTRATION -----------------
    from app.routes.routes import routes_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(routes_bp)
    app.register_blueprint(admin_bp)

    # ----------------- FLASK-ADMIN SETUP -----------------
    from . import models  # Import your models.py

    admin = Admin(app, name="Appointments Admin", template_mode="bootstrap3", endpoint='flask_admin', url="/creator")

    # Automatically add all SQLAlchemy models
    for name, cls in models.__dict__.items():
        if isinstance(cls, type) and issubclass(cls, db.Model):
            try:
                admin.add_view(ModelView(cls, db.session))
            except Exception as e:
                print(f"Skipping {name}: {e}")

    # ----------------- CONTEXT PROCESSOR -----------------
    @app.context_processor
    def inject_common():
        return {
            "current_year": datetime.utcnow().year,
            "config": app.config
        }     

    return app

from . import models
__all__ = ["create_app", "db"]
