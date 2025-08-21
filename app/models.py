from app import db

class Appointment(db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    cellphone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    service = db.Column(db.String(100), nullable=False)
    barber = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f"<Appointment {self.full_name} - {self.date} {self.time}>"
