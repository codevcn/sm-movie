from controllers.genres import (
    get_all_genres,
    get_multi_genres,
    get_genre_detail,
    create_genre,
    update_genre,
    delete_genre,
)
from flask import Blueprint, Flask


def register_genre_routes(app: Flask):
    # Tạo một Blueprint cho API routes
    api_blueprint = Blueprint("genre", __name__, url_prefix="/api/genres")

    # Định nghĩa các tuyến API
    api_blueprint.add_url_rule(
        "/get-all-genres", view_func=get_all_genres, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/get-multi/<string:slug>", view_func=get_multi_genres, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/get-detail/<int:id>", view_func=get_genre_detail, methods=["GET"]
    )
    api_blueprint.add_url_rule("/create", view_func=create_genre, methods=["POST"])
    api_blueprint.add_url_rule(
        "/update/<int:id>", view_func=update_genre, methods=["PUT"]
    )
    api_blueprint.add_url_rule(
        "/delete/<int:id>", view_func=delete_genre, methods=["DELETE"]
    )

    # Đăng ký Blueprint
    app.register_blueprint(api_blueprint)
