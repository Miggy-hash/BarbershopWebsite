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

@routes_bp.route('/emel-calendar')
def ECALENDAR():
    return render_template('emel-calendar.html')

@routes_bp.route('/boboy-calendar')
def BCALENDAR():
    return render_template('boboy-calendar.html')

@routes_bp.route('/emel-services')
def ESERVICES():
    return render_template('emel-services.html')

@routes_bp.route('/boboy-services')
def BSERVICES():
    return render_template('boboy-services.html')

@routes_bp.route('/receipt')
def RECEIPT():
    return render_template('receipt.html')