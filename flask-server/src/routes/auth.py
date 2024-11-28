from controllers.auth import register, login
from flask import Blueprint, Flask


def register_auth_routes(app: Flask):
    # Tạo một Blueprint cho API routes
    api_blueprint = Blueprint("auth", __name__, url_prefix="/api/auth")

    # Định nghĩa các tuyến API
    api_blueprint.add_url_rule("/register", view_func=register, methods=["POST"])
    api_blueprint.add_url_rule("/login", view_func=login, methods=["POST"])

    # Đăng ký Blueprint
    app.register_blueprint(api_blueprint)
