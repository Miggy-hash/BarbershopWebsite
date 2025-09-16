import os
import logging
from flask import Flask, session
from datetime import datetime, timedelta
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_mail import Mail
from dotenv import load_dotenv  

mail = Mail()
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

socketio = SocketIO()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, 'instance', 'appointments.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'super-secret-key-1234567890'
    app.config['SESSION_COOKIE_NAME'] = 'myapp_session'
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_DOMAIN'] = None
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)
    app.config['SESSION_COOKIE_PATH'] = '/'

    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = os.environ.get('GMAIL_USERNAME') # Your Gmail email
    app.config['MAIL_PASSWORD'] = os.environ.get('GMAIL_APP_PASSWORD')  # App Password
    app.config['MAIL_DEFAULT_SENDER'] = ('Slick Grind Barbers', os.environ.get('GMAIL_USERNAME'))

    mail.init_app(app)
    db.init_app(app)
    socketio.init_app(app, cors_allowed_origins=["http://127.0.0.1:5000", "http://192.168.100.94:5000"])
    migrate.init_app(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'admin.ADMINLOGIN'
    logger.info("LoginManager initialized")

    from app.models import User, Appointment, Review
    @login_manager.user_loader
    def load_user(user_id):
        logger.info(f"Loading user with ID: {user_id}, type: {type(user_id)}")
        try:
            user = User.query.get(int(user_id))
            logger.info(f"Loaded user: {user.username if user else 'None'}")
            return user
        except Exception as e:
            logger.error(f"Error loading user {user_id}: {str(e)}")
            return None

    with app.app_context():
        db.create_all()
        logger.info("Database initialized")

    from app.routes.routes import routes_bp
    from app.routes.admin_routes import admin_bp
    app.register_blueprint(routes_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    logger.info("Blueprints registered: routes, admin")

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