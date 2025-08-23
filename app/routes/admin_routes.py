from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from app import db
from app.models import Appointment
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Function to sanitize strings for JSON
def sanitize_string(s):
    if s is None:
        return 'N/A'
    return str(s)  # Let jsonify and tojson handle escaping

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# Hardcoded credentials (for now)
VALID_USERS = {"emel", "boboy"}
ADMIN_PASSWORD = "slick123"

@admin_bp.route("/login", methods=["GET", "POST"])
def ADMINLOGIN():
    if request.method == "POST":
        username = request.form.get("admin_username")
        password = request.form.get("admin_password")

        DASHBOARD_ROUTES = {
            "emel": "admin.Edashboard_home",
            "boboy": "admin.Bdashboard_home"
        }

        if username in VALID_USERS and password == ADMIN_PASSWORD:
            session["username"] = username
            return redirect(url_for(DASHBOARD_ROUTES[username]))
        else:
            flash("Invalid username and password", "error")

    return render_template("admin/adminLogin.html")

@admin_bp.route("/edashboard")
def Edashboard_home():
    if "username" not in session:
        return redirect(url_for("admin.ADMINLOGIN"))

    # Default date (today in DB format with zero-pad)
    today_dt = datetime.today()
    date_for_check = today_dt.strftime("%B %d, %Y")
    logger.debug(f"Edashboard: Querying for date {date_for_check}")

    # Query appointments for today
    try:
        appointments = Appointment.query.filter_by(barber="Emel Calomos", date=date_for_check).all()
        booked = {a.time: {
            'full_name': sanitize_string(a.full_name),
            'service': sanitize_string(a.service)
        } for a in appointments}
        logger.debug(f"Edashboard: Found {len(appointments)} appointments")
    except Exception as e:
        logger.error(f"Edashboard: Error querying appointments: {e}")
        booked = {}

    # Display date (non-padded day)
    display_date = f"{today_dt.strftime('%B')} {today_dt.day}, {today_dt.year}"

    # Fixed time slots (matching user booking slots)
    time_slots = [
        {'24h': '09:00', 'label': '9:00 AM'},
        {'24h': '10:00', 'label': '10:00 AM'},
        {'24h': '11:00', 'label': '11:00 AM'},
        {'24h': '13:00', 'label': '1:00 PM'},
        {'24h': '14:00', 'label': '2:00 PM'},
        {'24h': '15:00', 'label': '3:00 PM'},
        {'24h': '16:00', 'label': '4:00 PM'},
        {'24h': '17:00', 'label': '5:00 PM'},
    ]

    return render_template("admin/emel-dashboard_home.html",
                           username=session["username"],
                           booked=booked,
                           time_slots=time_slots,
                           display_date=display_date)

@admin_bp.route('/emel-appointments/<date>')
def get_emel_appointments(date):
    logger.debug(f"Fetching appointments for date: {date}")
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
        formatted_date = dt.strftime("%B %d, %Y")
        logger.debug(f"Formatted date for DB query: {formatted_date}")
    except ValueError as e:
        logger.error(f"Invalid date format: {date}, Error: {e}")
        return jsonify({'error': 'Invalid date format'}), 400

    try:
        appointments = Appointment.query.filter_by(barber="Emel Calomos", date=formatted_date).all()
        logger.debug(f"Found {len(appointments)} appointments for {formatted_date}")
        booked = {
            a.time: {
                'full_name': sanitize_string(a.full_name),
                'service': sanitize_string(a.service),
                'cellphone': sanitize_string(a.cellphone),
                'email': sanitize_string(a.email),
                'barber': sanitize_string(a.barber),
                'date': sanitize_string(a.date),
                'time': sanitize_string(a.time)
            } for a in appointments
        }
        return jsonify(booked)
    except Exception as e:
        logger.error(f"Error querying appointments: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/emel-appointments-count/<int:year>/<int:month>')
def get_emel_appointments_count(year, month):
    logger.debug(f"Fetching appointment counts for year: {year}, month: {month}")
    try:
        # First and last day of the month
        first_day = datetime(year, month, 1)
        last_day = datetime(year, month + 1, 1) if month < 12 else datetime(year + 1, 1, 1)

        # Query appointments for Emel in the month
        appointments = Appointment.query.filter(
            Appointment.barber == "Emel Calomos",
            Appointment.date >= first_day.strftime("%B %d, %Y"),
            Appointment.date < last_day.strftime("%B %d, %Y")
        ).all()
        logger.debug(f"Found {len(appointments)} appointments for month {month}/{year}")

        # Count appointments per day
        appointment_counts = {}
        for a in appointments:
            date_key = datetime.strptime(a.date, "%B %d, %Y").strftime("%Y-%m-%d")
            appointment_counts[date_key] = appointment_counts.get(date_key, 0) + 1

        return jsonify(appointment_counts)
    except Exception as e:
        logger.error(f"Error fetching appointment counts: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route("/bdashboard")
def Bdashboard_home():
    if "username" not in session:
        return redirect(url_for("admin.ADMINLOGIN"))
    
    today_dt = datetime.today()
    date_for_check = today_dt.strftime("%B %d, %Y")
    logger.debug(f"Bdashboard: Querying for date {date_for_check}")

    try:
        appointments = Appointment.query.filter_by(barber="Angelo Paballa", date=date_for_check).all()
        booked = {a.time: {
            'full_name': sanitize_string(a.full_name),
            'service': sanitize_string(a.service)
        } for a in appointments}
        logger.debug(f"Bdashboard: Found {len(appointments)} appointments")
    except Exception as e:
        logger.error(f"Bdashboard: Error querying appointments: {e}")
        booked = {}

    display_date = f"{today_dt.strftime('%B')} {today_dt.day}, {today_dt.year}"

    time_slots = [
        {'24h': '09:00', 'label': '9:00 AM'},
        {'24h': '10:00', 'label': '10:00 AM'},
        {'24h': '11:00', 'label': '11:00 AM'},
        {'24h': '13:00', 'label': '1:00 PM'},
        {'24h': '14:00', 'label': '2:00 PM'},
        {'24h': '15:00', 'label': '3:00 PM'},
        {'24h': '16:00', 'label': '4:00 PM'},
        {'24h': '17:00', 'label': '5:00 PM'},
    ]

    return render_template("admin/boboy-dashboard_home.html", 
                           username=session["username"],
                           booked=booked,
                           time_slots=time_slots,
                           display_date=display_date)

@admin_bp.route('/boboy-appointments/<date>')
def get_boboy_appointments(date):
    logger.debug(f"Fetching Boboy appointments for date: {date}")
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
        formatted_date = dt.strftime("%B %d, %Y")
    except ValueError as e:
        logger.error(f"Invalid date format: {date}, Error: {e}")
        return jsonify({'error': 'Invalid date format'}), 400

    try:
        appointments = Appointment.query.filter_by(barber="Angelo Paballa", date=formatted_date).all()
        logger.debug(f"Found {len(appointments)} appointments for {formatted_date}")
        booked = {
            a.time: {
                'full_name': sanitize_string(a.full_name),
                'service': sanitize_string(a.service),
                'cellphone': sanitize_string(a.cellphone),
                'email': sanitize_string(a.email),
                'barber': sanitize_string(a.barber),
                'date': sanitize_string(a.date),
                'time': sanitize_string(a.time)
        } for a in appointments
    }
        return jsonify(booked)
    except Exception as e:
        logger.error(f"Error querying Boboy appointments: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/boboy-appointments-count/<int:year>/<int:month>')
def get_boboy_appointments_count(year, month):
    logger.debug(f"Fetching Boboy appointment counts for year: {year}, month: {month}")
    try:
        first_day = datetime(year, month, 1)
        last_day = datetime(year, month + 1, 1) if month < 12 else datetime(year + 1, 1, 1)

        # Query appointments for Boboy in the month
        appointments = Appointment.query.filter(
            Appointment.barber == "Angelo Paballa",
            Appointment.date >= first_day.strftime("%B %d, %Y"),
            Appointment.date < last_day.strftime("%B %d, %Y")
        ).all()
        logger.debug(f"Found {len(appointments)} appointments for month {month}/{year}")

        # Count appointments per day
        appointment_counts = {}
        for a in appointments:
            date_key = datetime.strptime(a.date, "%B %d, %Y").strftime("%Y-%m-%d")
            appointment_counts[date_key] = appointment_counts.get(date_key, 0) + 1

        return jsonify(appointment_counts)
    except Exception as e:
        logger.error(f"Error fetching Boboy appointment counts: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('admin.ADMINLOGIN'))