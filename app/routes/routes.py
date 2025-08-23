from flask import Blueprint, render_template, request, redirect, url_for, session, make_response
from app import db
from app.models import Appointment
from datetime import datetime
from flask import jsonify

routes_bp = Blueprint('routes', __name__)

@routes_bp.route('/')
def HOME():
    return render_template('home.html')

@routes_bp.route('/login')
def login():
    return render_template('login.html')

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

@routes_bp.route('/barber')
def BARBER():
    if session.get("booking_complete"):
        session.clear()
        return redirect("/login")
    if "user" not in session:
        return redirect("/login")
    response = make_response(render_template('barber.html'))
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@routes_bp.route('/emel-calendar', methods=['GET']) 
def ECALENDAR():
    if session.get("booking_complete"):
        session.clear()
        return redirect("/login")  # Added explicit return
    if "user" not in session:
        return redirect("/login")
    selected_service = session.get("selected_service")

    # Use consistent date format with zero-padded day
    date_for_check = session.get("selected_date", datetime.today().strftime("%B %d, %Y"))

    # Query for booked times on this date for this barber
    appointments = Appointment.query.filter_by(barber="Emel Calomos", date=date_for_check).all()
    booked_times = [a.time for a in appointments]

    response = make_response(render_template("emel-calendar.html",
                           service=selected_service,
                           booked_times=booked_times,
                           selected_date=date_for_check
                           ))
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@routes_bp.route('/emel-calendar/times/<barber>/<date>')
def get_booked_times(barber, date):
    try:
        # Convert incoming YYYY-MM-DD to stored format "%B %d, %Y" (with zero-padded day)
        dt = datetime.strptime(date, "%Y-%m-%d")
        formatted_date = dt.strftime("%B %d, %Y")
    except ValueError:
        # Invalid date: return empty list
        return jsonify([])

    # Query using formatted date
    appointments = Appointment.query.filter_by(barber=barber, date=formatted_date).all()
    booked_times = [a.time for a in appointments]  # 24-hour format
    return jsonify(booked_times)

@routes_bp.route('/boboy-calendar', methods=['GET'])
def BCALENDAR():
    if session.get("booking_complete"):
        session.clear()
        return redirect("/login")  # Added explicit return
    if "user" not in session:
        return redirect("/login")
    selected_service = session.get("selected_service")
    date_for_check = session.get("selected_date", datetime.today().strftime("%B %d, %Y"))
    appointments = Appointment.query.filter_by(barber="Angelo Paballa", date=date_for_check).all()
    booked_times = [a.time for a in appointments]

    response = make_response(render_template("boboy-calendar.html",
                            service=selected_service,
                            booked_times=booked_times,
                            selected_date=date_for_check
                            ))
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@routes_bp.route('/emel-services')
def ESERVICES():
    if session.get("booking_complete"):
        session.clear()
        return redirect("/login")  # Added explicit return
    if "user" not in session:
        return redirect("/login")
    response = make_response(render_template('emel-services.html'))
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@routes_bp.route('/boboy-services')
def BSERVICES():
    if session.get("booking_complete"):
        session.clear()
        return redirect("/login")  # Added explicit return
    if "user" not in session:
        return redirect("/login")
    response = make_response(render_template('boboy-services.html'))
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

@routes_bp.route('/receipt')
def RECEIPT():
    stored_time = session.get("selected_time", "00:00")
    time_12h = datetime.strptime(stored_time, "%H:%M").strftime("%I:%M %p")
    return render_template('receipt.html',
                           full_name=session["user"]["full_name"],
                           cellphone=session["user"]["cellphone"],
                           email=session["user"]["email"],
                           service=session["selected_service"]["name"],
                           barber=session["selected_barber"],
                           date=session.get("selected_date"),
                           time=time_12h
                           )

# routing select services
@routes_bp.route("/select_service/<barber>/<service_name>")
def select_service(barber, service_name):
    if session.get("booking_complete"):
        session.clear()
        return redirect("/login")  # Added check here for completeness
    services = {
        "beard": {"name": "Beard Service", "price": 250, "icon": "icons/beard.png"},
        "haircut": {"name": "Regular Haircut", "price": 250, "icon": "icons/erazor.png"},
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
    if session.get("booking_complete"):
        session.clear()
        return redirect("/login")

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
    
    session["selected_date"] = date
    session["selected_time"] = time
    session["booking_complete"] = True  # Critical fix: Set the flag here!

    return redirect(url_for("routes.RECEIPT"))

@routes_bp.route('/logout')
def logout():
    session.clear()  # removes all session data
    return redirect(url_for('routes.HOME'))