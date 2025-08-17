from flask import Blueprint, render_template

routes_bp = Blueprint('routes', __name__)

@routes_bp.route('/')
def HOME():
    return render_template('home.html')

@routes_bp.route('/login')
def LOGIN():
    return render_template('login.html')

@routes_bp.route('/barber')
def BARBER():
    return render_template('barber.html')

@routes_bp.route('/calendar')
def CALENDAR():
    return render_template('calendar.html')

@routes_bp.route('/services')
def SERVICES():
    return render_template('services.html')

@routes_bp.route('/receipt')
def RECEIPT():
    return render_template('receipt.html')