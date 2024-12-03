from controllers.movie import (
    get_all_movies,
    get_movie_detail,
    count_movies_by_month,
    get_movies_by_month,
    get_total_viewed,
    create,
    update,
    update_viewed,
    delete,
    get_similar_movies,
    get_genres_by_id,
    get_movies_by_category,
)
from flask import Blueprint, Flask


def register_movie_routes(app: Flask):
    # Tạo một Blueprint cho API routes
    api_blueprint = Blueprint("movie", __name__, url_prefix="/api")

    # Định nghĩa các tuyến API
    api_blueprint.add_url_rule("/get-all", view_func=get_all_movies, methods=["GET"])
    api_blueprint.add_url_rule(
        "/get-detail/<string:id>", view_func=get_movie_detail, methods=["GET"]  # ok
    )
    api_blueprint.add_url_rule(
        "/get-count-movie-month", view_func=count_movies_by_month, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/get-movie-month", view_func=get_movies_by_month, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/get-total-view", view_func=get_total_viewed, methods=["GET"]
    )
    api_blueprint.add_url_rule("/create", view_func=create, methods=["POST"])
    api_blueprint.add_url_rule("/update/<int:id>", view_func=update, methods=["PUT"])
    api_blueprint.add_url_rule(
        "/update-viewed/<string:movie_id>", view_func=update_viewed, methods=["PUT"]
    )
    api_blueprint.add_url_rule("/delete/<int:id>", view_func=delete, methods=["DELETE"])
    api_blueprint.add_url_rule(
        "/similar-movies/<string:slug>", view_func=get_similar_movies, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/get-by-genres/<int:id>", view_func=get_genres_by_id, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/<string:category>/<string:type>",
        view_func=get_movies_by_category,
        methods=["GET"],
    )

    # Đăng ký Blueprint
    app.register_blueprint(api_blueprint)
