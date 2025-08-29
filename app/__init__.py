import os
from flask import Flask
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_migrate import Migrate
from flask_login import LoginManager

db = SQLAlchemy()
socketio = SocketIO(cors_allowed_origins=["http://127.0.0.1:5000", "http://192.168.100.94:5000"])
migrate = Migrate()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, 'instance', 'appointments.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'super-secret-key'

    db.init_app(app)
    socketio.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'admin.login'

    # Move user_loader here to avoid circular import
    from app.models import User
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    with app.app_context():
        db.create_all()

    from app.routes.routes import routes_bp
    from app.routes.admin_routes import admin_bp
    app.register_blueprint(routes_bp)   
    app.register_blueprint(admin_bp)

    from . import models
    admin = Admin(app, name="Appointments Admin", template_mode="bootstrap3", endpoint='flask_admin', url="/creator")
    for name, cls in models.__dict__.items():
        if isinstance(cls, type) and issubclass(cls, db.Model):
            try:
                admin.add_view(ModelView(cls, db.session))
            except Exception as e:
                print(f"Skipping {name}: {e}")

    @app.context_processor
    def inject_common():
        return {
            "current_year": datetime.utcnow().year,
            "config": app.config
        }     

    return app

from . import models
__all__ = ["create_app", "db", "migrate"]