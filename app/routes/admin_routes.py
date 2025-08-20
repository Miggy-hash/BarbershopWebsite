from flask import Blueprint, render_template, request, redirect, url_for, session, flash

admin_bp = Blueprint("admin", __name__, url_prefix="/admin" )

# Hardcoded credentials (for now)
VALID_USERS = {"emel", "boboy"}   # usernames
ADMIN_PASSWORD = "slick123"       # shared password

@admin_bp.route("/login", methods=["GET", "POST"])
def ADMINLOGIN():
    if request.method =="POST":
        username = request.form.get("admin_username")
        password = request.form.get("admin_password")

        print("DEBUG username:", username)
        print("DEBUG password:", password)
        
        if username in VALID_USERS and password == ADMIN_PASSWORD:
            session["admin"] = username
            return redirect(url_for("admin.dashboard_home"))
        else:
            flash("Invalid username and password", "error")

    return render_template("admin/adminLogin.html")

@admin_bp.route("/dashboard")
def dashboard_home():
    if "admin" not in session:
        return redirect(url_for("admin.ADMINLOGIN"))
    return render_template("admin/dashboard_home.html", username=session["admin"])