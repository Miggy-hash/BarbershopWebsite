from flask import Blueprint, render_template, request, redirect, url_for, session

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

@routes_bp.route('/emel-calendar')
def ECALENDAR():
    if "user" not in session:
        return redirect("/login")
    selected_service = session.get("selected_service")
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
    date = request.args.get("date")
    time = request.args.get("time")

    return render_template('receipt.html',
                           full_name=session["user"]["full_name"],
                           cellphone=session["user"]["cellphone"],
                           email=session["user"]["email"],
                           service=session["selected_service"]["name"],
                           barber=session["selected_barber"],
                           date=date,
                           time=time,
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