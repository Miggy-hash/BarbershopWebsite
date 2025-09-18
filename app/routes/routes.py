from flask import Blueprint, render_template, request, redirect, url_for, session, make_response, jsonify
from app import db, socketio, mail
from app.models import Appointment, Review
from datetime import datetime
from flask_socketio import SocketIO, emit
from flask_mail import Message
from threading import Thread
from flask import current_app
from dotenv import load_dotenv
import logging, requests, os, bleach

load_dotenv()
routes_bp = Blueprint('routes', __name__, template_folder='templates', static_folder='static')
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def get_review_data():
    logger.debug("Computing review data")
    try:
        logger.debug(f"Database URI: {db.engine.url}")
        reviews = Review.query.order_by(Review.created_at.desc()).all()
        logger.debug(f"Found {len(reviews)} reviews: {[{'id': r.id, 'rating': r.rating, 'comment': r.comment, 'appointment_id': r.appointment_id} for r in reviews]}")
        total_reviews = len(reviews)
        if total_reviews > 0:
            average_rating = round(sum(r.rating for r in reviews) / total_reviews, 1)
        else:
            average_rating = 0.0

        ratings_counts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        for r in reviews:
            if r.rating in ratings_counts:
                ratings_counts[r.rating] += 1

        comments = []
        for r in reviews:
            try:
                appointment = Appointment.query.get(r.appointment_id)
                name = appointment.full_name if appointment else 'Anonymous'
            except Exception as e:
                logger.warning(f"Failed to get appointment for review {r.id}: {str(e)}")
                name = 'Anonymous'
            comments.append({
                'name': name,
                'rating': r.rating,
                'date': r.created_at.isoformat(),
                'text': r.comment or ''
            })
        logger.debug(f"Review data: average_rating={average_rating}, total_reviews={total_reviews}, ratings_counts={ratings_counts}, comments={comments}")
        return {
            'average_rating': average_rating,
            'total_reviews': total_reviews,
            'ratings_counts': ratings_counts,
            'comments': comments
        }
    except Exception as e:
        logger.error(f"Error computing review data: {str(e)}")
        return {
            'average_rating': 0.0,
            'total_reviews': 0,
            'ratings_counts': {5: 0, 4: 0, 3: 0, 2: 0, 1: 0},
            'comments': []
        }

@routes_bp.route('/')
def HOME():
    review_data = get_review_data()
    logger.debug(f"Rendering home.html with review_data: {review_data}")
    print(f"Review data sent to template: {review_data}")
    return render_template('home.html', **review_data)

@routes_bp.route('/debug-reviews')
def debug_reviews():
    reviews = Review.query.all()
    return jsonify([{'id': r.id, 'rating': r.rating, 'comment': r.comment, 'created_at': r.created_at.isoformat(), 'appointment_id': r.appointment_id} for r in reviews])

@routes_bp.route("/login", methods=["POST", "GET"])
def LOGIN():
    if "user" in session:
        logger.info(f"User already in session: {session['user']}")
        return redirect(url_for('routes.BARBER'))
    logger.info(f"Request headers: {request.headers}")
    if request.method == "POST":
        full_name = request.form.get("full_name")
        cellphone = request.form.get("cellphone")
        email = request.form.get("email")
        logger.info(f"User login attempt: {full_name}, {cellphone}, {email}")
        if not all([full_name, cellphone, email]):
            logger.info("Missing login fields")
            return render_template("login.html")
        session.clear()
        session["user"] = {
            "full_name": full_name,
            "cellphone": cellphone,
            "email": email
        }
        session.permanent = True
        session.modified = True
        logger.info(f"Session set: {session['user']}")
        logger.info(f"Redirecting to: routes.BARBER")
        return redirect(url_for('routes.BARBER'))
    logger.info("Rendering user login page")
    return render_template("login.html")

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
        return redirect("/login")
    if "user" not in session:
        return redirect("/login")
    selected_service = session.get("selected_service")
    date_for_check = session.get("selected_date", datetime.today().strftime("%B %d, %Y"))
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
def Eget_booked_times(barber, date):
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
        formatted_date = dt.strftime("%B %d, %Y")
    except ValueError:
        return jsonify([])
    appointments = Appointment.query.filter_by(barber=barber, date=formatted_date).all()
    booked_times = [a.time for a in appointments]
    return jsonify(booked_times)

@routes_bp.route('/boboy-calendar/times/<barber>/<date>')
def Bget_booked_times(barber, date):
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
        formatted_date = dt.strftime("%B %d, %Y")
    except ValueError:
        return jsonify([])
    appointments = Appointment.query.filter_by(barber=barber, date=formatted_date).all()
    booked_times = [a.time for a in appointments]
    return jsonify(booked_times)

@routes_bp.route('/boboy-calendar', methods=['GET'])
def BCALENDAR():
    if session.get("booking_complete"):
        session.clear()
        return redirect("/login")
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
        return redirect("/login")
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
        return redirect("/login")
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
    dt = datetime.strptime(stored_time, "%H:%M")
    try:
        time_12h = dt.strftime("%-I:%M %p")
    except ValueError:
        time_12h = dt.strftime("%I:%M %p").lstrip("0")
    return render_template('receipt.html',
                           full_name=session["user"]["full_name"],
                           cellphone=session["user"]["cellphone"],
                           email=session["user"]["email"],
                           service=session["selected_service"]["name"],
                           barber=session["selected_barber"],
                           date=session.get("selected_date"),
                           time=time_12h)

@routes_bp.route("/select_service/<barber>/<service_name>")
def select_service(barber, service_name):
    if session.get("booking_complete"):
        session.clear()
        return redirect("/login")
    services = {
        "beard": {"name": "Beard Service", "price": 250, "icon": "icons/beard.png"},
        "haircut": {"name": "Regular Haircut", "price": 250, "icon": "icons/erazor.png"},
        "home": {"name": "Home Service", "price": 250, "icon": "icons/home.png"},
        "full": {"name": "Full Service", "price": 250, "icon": "icons/chair.png"},
        "shave": {"name": "Full Shave", "price": 250, "icon": "icons/razor.png"}
    }
    if service_name in services:
        session["selected_service"] = services[service_name]
        session["selected_barber"] = barber
    if barber == "Emel Calomos":
        return redirect(url_for("routes.ECALENDAR"))
    elif barber == "Angelo Paballa":
        return redirect(url_for("routes.BCALENDAR"))
    else:
        return redirect(url_for("routes.HOME"))

def format_phone_number(cellphone):
    if not cellphone:
        return None
    cellphone = cellphone.strip()
    if cellphone.startswith('0') and len(cellphone) == 11:
        return '+63' + cellphone[1:]
    elif cellphone.startswith('+63') and len(cellphone) == 12:
        return cellphone
    else:
        logger.warning(f"Invalid phone format: {cellphone}")
        return None

@routes_bp.route("/confirm", methods=["POST"])
def confirm_booking():
    try:
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

        logger.debug(f"Confirm booking: full_name={full_name}, cellphone={cellphone}, email={email}, service={service}, barber={barber}, date={date}, time={time}")

        existing = Appointment.query.filter_by(barber=barber, date=date, time=time).first()
        if existing:
            logger.warning(f"Slot already booked: barber={barber}, date={date}, time={time}")
            return jsonify({"success": False, "message": "This time slot has already been booked."}), 400

        new_appointment = Appointment(
            full_name=full_name,
            cellphone=cellphone,
            email=email,
            service=service,
            barber=barber,
            date=date,
            time=time,
            created_at=datetime.utcnow(),
            is_read=False
        )
        db.session.add(new_appointment)
        db.session.commit()
        logger.info(f"Appointment saved: id={new_appointment.id}, barber={barber}, date={date}, time={time}")

        def send_async_email(app, msg):
            with app.app_context():
                mail.send(msg)

        email_sent = False
        try:
            dt = datetime.strptime(time, "%H:%M")
            formatted_time = dt.strftime("%I:%M %p").lstrip("0")
            html_body = render_template('email_confirmation.html', appointment=new_appointment, formatted_time=formatted_time)
            msg = Message(
                subject="Your Barbershop Appointment Confirmation",
                recipients=[email],
                html=html_body,
                body=f"Your appointment is confirmed for {date} at {formatted_time} with {barber} for {service}."
            )
            Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()
            logger.info(f"Async confirmation email queued for {email} for appointment ID {new_appointment.id}")
            email_sent = True
        except Exception as email_err:
            logger.error(f"Failed to queue email to {email}: {str(email_err)}")

        sms_sent = False
        try:
            dt = datetime.strptime(time, "%H:%M")
            formatted_time = dt.strftime("%I:%M %p").lstrip("0")
            message = f"Hi {full_name}! Your appt with {barber} on {date} at {formatted_time} for {service} is confirmed. Reply STOP to cancel. - SlickGrind"
            if len(message) > 160:
                logger.warning(f"SMS message too long ({len(message)} chars), truncating")
                message = message[:157] + "..."

            formatted_phone = format_phone_number(cellphone)
            if not formatted_phone:
                logger.error(f"Invalid phone number for SMS: {cellphone}")
            else:
                api_key = os.environ.get('SEMAPHORE_API_KEY')
                sender_id = os.environ.get('SEMAPHORE_SENDER_ID')
                url = 'https://api.semaphore.co/api/v4/messages'
                payload = {
                    'apikey': api_key,
                    'number': formatted_phone,
                    'message': message,
                    'senderid': sender_id
                }
                response = requests.post(url, data=payload)
                response.raise_for_status()
                if response.json().get('status') == 'success':
                    logger.info(f"SMS sent to {formatted_phone} for appointment ID {new_appointment.id}")
                    sms_sent = True
                else:
                    logger.error(f"SMS API error for {formatted_phone}: {response.text}")
        except Exception as sms_err:
            logger.error(f"Failed to send SMS to {cellphone}: {str(sms_err)}")

        session["full_name"] = full_name
        session["cellphone"] = cellphone
        session["email"] = email
        session["service"] = service
        session["barber"] = barber
        session["selected_date"] = date
        session["selected_time"] = time
        session["booking_complete"] = True

        room = barber.lower().replace(" ", "_")
        appointment_data = {
            "id": new_appointment.id,
            "full_name": full_name,
            "cellphone": cellphone,
            "email": email,
            "service": service,
            "barber": barber,
            "date": date,
            "time": time,
            "created_at": new_appointment.created_at.isoformat(),
            "is_read": new_appointment.is_read
        }
        logger.debug(f"Emitting slot_booked to room={room}: {appointment_data}")
        socketio.emit("slot_booked", appointment_data, room=room)
        logger.info(f"Successfully emitted slot_booked to room={room}")

        return jsonify({"success": True, "redirect": url_for("routes.RECEIPT", email_sent=email_sent, sms_sent=sms_sent)})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in confirm_booking: {str(e)}", exc_info=True)
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500

@routes_bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('routes.HOME'))

@routes_bp.route('/submit-review', methods=['POST'])
def submit_review():
    try:
        data = request.json
        full_name = data.get('full_name')
        date = data.get('date')
        rating = data.get('rating')
        comment = data.get('comment', '')

        logger.debug(f"Received review data: full_name={full_name}, date={date}, rating={rating}, comment={comment}")

        if not all([full_name, date, rating]):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        try:
            rating = int(rating)
            if rating < 1 or rating > 5:
                return jsonify({'success': False, 'message': 'Rating must be between 1 and 5'}), 400
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Invalid rating format'}), 400

        try:
            datetime.strptime(date, '%B %d, %Y')
        except ValueError:
            return jsonify({'success': False, 'message': 'Invalid date format'}), 400

        comment = bleach.clean(comment, tags=[], strip=True)[:250]

        appointment = Appointment.query.filter_by(full_name=full_name, date=date).first()
        if not appointment:
            return jsonify({'success': False, 'message': 'No appointment found for this name and date'}), 404

        existing_review = Review.query.filter_by(appointment_id=appointment.id).first()
        if existing_review:
            return jsonify({'success': False, 'message': 'A review has already been submitted for this appointment'}), 400

        new_review = Review(
            appointment_id=appointment.id,
            rating=rating,
            comment=comment if comment else None,
            created_at=datetime.utcnow()
        )
        db.session.add(new_review)
        db.session.commit()
        logger.info(f"Review saved: id={new_review.id}, appointment_id={appointment.id}, rating={rating}")

        review_data = get_review_data()
        socketio.emit('new_review', review_data, namespace='/')
        logger.info("Emitted new_review event")

        return jsonify({'success': True, 'message': 'Review submitted successfully'})
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error submitting review: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500