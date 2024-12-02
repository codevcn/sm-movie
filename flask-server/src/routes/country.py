from controllers.country import get_all_countries
from flask import Blueprint, Flask


def register_country_routes(app: Flask):
    # Tạo một Blueprint cho API routes
    api_blueprint = Blueprint("country", __name__, url_prefix="/api/country")

    # Định nghĩa các tuyến API
    api_blueprint.add_url_rule(
        "/get-all-countries", view_func=get_all_countries, methods=["GET"]
    )

    # Đăng ký Blueprint
    app.register_blueprint(api_blueprint)
