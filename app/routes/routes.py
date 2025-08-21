from flask import Blueprint, render_template, request, redirect, url_for, session
from app import db
from app.models import Appointment

routes_bp = Blueprint('routes', __name__)

@routes_bp.route('/')
def HOME():
    return render_template('home.html')

@routes_bp.route('/login')
def login():
    return render_template('login.html')

@routes_bp.route('/barber')
def BARBER():
    if "user" not in session:   # check if not logged in
        return redirect("/login")  # kick back to login
    return render_template('barber.html')

@routes_bp.route('/emel-calendar', methods=['GET', 'POST'])
def ECALENDAR():
    if "user" not in session:
        return redirect("/login")
    selected_service = session.get("selected_service")

    if request.method =="POST":
        session["selected_date"] = request.form["date"]
        session["selected_time"] = request.form["time"]
        return redirect(url_for("routes.confirmbooking"))

    return render_template("emel-calendar.html", service=selected_service)

@routes_bp.route('/boboy-calendar')
def BCALENDAR():
    if "user" not in session:
        return redirect("/login")
    selected_service = session.get("selected_service")
    return render_template("boboy-calendar.html", service=selected_service)

@routes_bp.route('/emel-services')
def ESERVICES():
    if "user" not in session:
        return redirect("/login")
    return render_template('emel-services.html')

@routes_bp.route('/boboy-services')
def BSERVICES():
    if "user" not in session:
        return redirect("/login")
    return render_template('boboy-services.html')

@routes_bp.route('/receipt')
def RECEIPT():
    return render_template('receipt.html',
                           full_name=session["user"]["full_name"],
                           cellphone=session["user"]["cellphone"],
                           email=session["user"]["email"],
                           service=session["selected_service"]["name"],
                           barber=session["selected_barber"],
                           date=session.get("selected_date"),
                           time=session.get("selected_time"),
                           )

@routes_bp.route("/login", methods=["POST", "GET"])
def LOGIN():
    full_name = request.form.get("full_name")
    cellphone = request.form.get("cellphone")
    email = request.form.get("email")

    # Store details (DB, session, etc.)
    # e.g. save to session:
    session["user"] = {
        "full_name": full_name,
        "cellphone": cellphone,
        "email": email
    }

    # Redirect to barber page
    return redirect(url_for('routes.BARBER'))

# routing select services
@routes_bp.route("/select_service/<barber>/<service_name>")
def select_service(barber, service_name):
    services = {
        "beard": {"name": "Beard Service", "price": 250, "icon": "icons/beard.png"},
        "haircut": {"name": "Men's Haircut", "price": 250, "icon": "icons/erazor.png"},
        "home": {"name": "Home Service", "price": 250, "icon": "icons/home.png"},
        "full": {"name": "Full Service", "price": 250, "icon": "icons/chair.png"},
        "shave": {"name": "Full Shave", "price": 250, "icon": "icons/razor.png"}
    }

    if service_name in services:
        session["selected_service"] = services[service_name]
        session["selected_barber"] = barber  # keep track of which barber

    # Decide which calendar to redirect to
    if barber == "Emel Calomos":
        return redirect(url_for("routes.ECALENDAR"))
    elif barber == "Angelo Paballa":
        return redirect(url_for("routes.BCALENDAR"))
    else:
        return redirect(url_for("routes.home"))
    
@routes_bp.route("/confirm", methods=["POST"])
def confirm_booking():
        full_name = request.form["full_name"]
        cellphone = request.form["cellphone"]
        email = request.form["email"]
        service = request.form["service"]
        barber = request.form["barber"]
        date = request.form["date"]
        time = request.form["time"]

        new_appointment = Appointment(
            full_name=full_name,
            cellphone=cellphone,
            email=email,
            service=service,
            barber=barber,
            date=date,
            time=time
        )

        db.session.add(new_appointment)
        db.session.commit()

        return redirect(url_for("routes.RECEIPT"))
    