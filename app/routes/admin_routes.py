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
    return render_template("admin/emel-dashboard_home.html", username=session["username"])

@admin_bp.route("/bdashboard")
def Bdashboard_home():
    if "username" not in session:
        return redirect(url_for("admin.ADMINLOGIN"))
    return render_template("admin/boboy-dashboard_home.html", username=session["username"])