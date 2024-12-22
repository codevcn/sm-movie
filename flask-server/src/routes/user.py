from controllers.user import (
    get_all,
    get_detail,
    count_each_month,
    edit_user,
    update_user,
    change_password,
    delete_user,
    upload_user_avatar,
    upload_image,
)
from controllers.favorite_list import (
    get_list_favorites_movie,
    get_user_movie_favorites,
    add_favorites_movie,
)
from controllers.watch_history import (
    get_user_movie_histories,
    add_histories_movie,
)
from controllers.rating import user_rate_movie, get_rating
from flask import Blueprint, Flask


def register_user_routes(app: Flask):
    # Tạo một Blueprint cho API routes
    api_blueprint = Blueprint("user", __name__, url_prefix="/api/user")

    # Định nghĩa các tuyến API cho user
    api_blueprint.add_url_rule("/get-all-user", view_func=get_all, methods=["GET"])
    api_blueprint.add_url_rule(
        "/get-detail/<string:email>", view_func=get_detail, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/get-user-all-year", view_func=count_each_month, methods=["GET"]
    )
    api_blueprint.add_url_rule(
        "/edit-user/<string:user_email>", view_func=edit_user, methods=["PUT"]
    )
    api_blueprint.add_url_rule(
        "/update-user/<string:email>", view_func=update_user, methods=["PUT"]
    )
    api_blueprint.add_url_rule(
        "/change-password", view_func=change_password, methods=["PUT"]
    )
    api_blueprint.add_url_rule(
        "/delete/<int:user_id>", view_func=delete_user, methods=["DELETE"]
    )
    api_blueprint.add_url_rule(
        "/delete-user-client/<int:user_id>", view_func=delete_user, methods=["PUT"]
    )
    api_blueprint.add_url_rule(
        "/upload-avatar/<string:user_id>",
        view_func=upload_user_avatar,
        methods=["POST"],
    )

    # Định nghĩa các tuyến API cho favorite
    api_blueprint.add_url_rule(
        "/get-favorites-movie/<int:user_id>",
        view_func=get_list_favorites_movie,
        methods=["GET"],
    )
    api_blueprint.add_url_rule(
        "/user-favorites/<int:user_id>",
        view_func=get_user_movie_favorites,
        methods=["GET"],
    )
    api_blueprint.add_url_rule(
        "/add-favourite", view_func=add_favorites_movie, methods=["POST"]
    )

    # Định nghĩa các tuyến API cho history
    api_blueprint.add_url_rule(
        "/user-history/<int:user_id>",
        view_func=get_user_movie_histories,
        methods=["GET"],
    )
    api_blueprint.add_url_rule(
        "/add-history", view_func=add_histories_movie, methods=["POST"]
    )

    # Định nghĩa các tuyến API cho rating
    api_blueprint.add_url_rule(
        "/rate-a-movie", view_func=user_rate_movie, methods=["POST"]
    )
    api_blueprint.add_url_rule("/get-rating", view_func=get_rating, methods=["POST"])

    # others
    api_blueprint.add_url_rule(
        "/upload-image", view_func=upload_image, methods=["POST"]
    )

    # Đăng ký Blueprint
    app.register_blueprint(api_blueprint)
