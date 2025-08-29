from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    hashed_password = generate_password_hash("slick123")
    if not User.query.filter_by(username="emel").first():
        emel = User(username="emel", password=hashed_password)
        db.session.add(emel)
    if not User.query.filter_by(username="boboy").first():
        boboy = User(username="boboy", password=hashed_password)
        db.session.add(boboy)
    db.session.commit()
    print("Admin accounts added to users table.")